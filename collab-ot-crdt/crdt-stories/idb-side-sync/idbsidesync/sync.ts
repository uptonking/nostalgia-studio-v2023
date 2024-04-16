import {
  type SyncPlugin,
  type SyncProfile,
  type UserProfile,
} from '../types/main';
import * as db from './db';
import { HLTime } from './HLTime';
import { debug, LIB_NAME, log } from './utils';

/** 全局同步插件集合 */
export const plugins: SyncPlugin[] = [];

/** 执行同步
 * - 先查询本地的上次上传时间戳，每次上传都会更新本地时间
 * - 先上传op数据到云端，然后从云端下载op数据
 */
export async function sync(options: { forceFullSync?: boolean } = {}) {
  const { nodeId: localClientId } = db.getSettings();

  // Attempt to do a sync using each registered plugin
  for (const plugin of plugins) {
    const pluginId = plugin.getPluginId();
    try {
      debug &&
        log.debug(
          `Attempting to sync with remote storage using '${pluginId}' plugin.`,
        );

      // 先检查云端数据文件是否存在，若不存在或强制覆盖就先创建空文件
      await plugin.saveRemoteClientRecord(localClientId);

      // Which of this client's own oplog entries needs to be uploaded to the server?
      const mostRecentUploadedEntryTime = options.forceFullSync
        ? null
        : await plugin.getMostRecentUploadedEntryTime();

      if (mostRecentUploadedEntryTime) {
        log.debug(
          `Uploading OWN local entries created after ${mostRecentUploadedEntryTime}.`,
        );
      } else {
        log.debug(`Uploading ALL local entries.`);
      }

      // 👉🏻 上传op到云端 Upload own oplog entries that are missing from the server.
      let ownEntryUploadCounter = 0;
      for await (const localEntry of db.getEntriesByClient(localClientId, {
        afterTime: mostRecentUploadedEntryTime,
      })) {
        // console.log(';; up ', localEntry)
        //TODO: Add support for uploading more than one entry at a time (batching)
        const hlTime = HLTime.parse(localEntry.hlcTime);
        const result = await plugin.saveRemoteEntry({
          time: new Date(hlTime.millis()),
          counter: hlTime.counter(),
          clientId: hlTime.node(),
          entry: localEntry,
        });
        ownEntryUploadCounter += result.numUploaded;
      }
      debug &&
        log.debug(`Uploaded ${ownEntryUploadCounter} local oplog entries.`);

      debug &&
        log.debug(
          `Attempting to discover remote clients on server and download their oplog entries...`,
        );

      // 查询除clientId外其他设备对应的op列表
      for await (const clientRecord of plugin.getRemoteClientRecords({
        excludeClientIds: [localClientId],
      })) {
        const remoteClientId = clientRecord.clientId;

        // What is the most recent oplog entry time we know of for the current remote client?
        let mostRecentKnownOplogTimeForRemoteClient: Date | null = null;
        try {
          // 查询clientId在本地的最新记录
          const mostRecentEntry =
            await db.getMostRecentEntryForClient(remoteClientId);
          if (mostRecentEntry) {
            mostRecentKnownOplogTimeForRemoteClient = new Date(
              HLTime.parse(mostRecentEntry.hlcTime).millis(),
            );
          }
        } catch (error) {
          log.error(
            `Error on attempt to determine most recent oplog entry time for client ${remoteClientId}`,
            error,
          );
        }

        let remoteEntryDownloadCounter = 0;
        // 👉🏻 从云端下载本地不存在的op
        for await (const remoteEntry of plugin.getRemoteEntries({
          clientId: remoteClientId,
          afterTime: mostRecentKnownOplogTimeForRemoteClient,
        })) {
          // 👀 this will increment the local HLC time.
          db.applyOplogEntry(remoteEntry);
          remoteEntryDownloadCounter++;
        }
        log.debug(
          `Downloaded ${remoteEntryDownloadCounter} oplog entries for remote client '${remoteClientId}'.`,
        );
      }

      //TODO: Save any plugin settings that may have changed as part of the sync (e.g., the plugin updated its info
      // about the last oplog entry that was uploaded).
      const syncProfile = {
        ...getSyncProfileForPlugin(pluginId),
      } as SyncProfile;
      syncProfile.settings = plugin.getSettings();
      saveSyncProfile(syncProfile);
    } catch (error) {
      log.error(`Error while attempting to sync with ${pluginId}:`, error);
    }
  }
}

/** 注册同步插件到全局，执行插件的初始化逻辑；触发自动登录帐号 */
export async function registerSyncPlugin(plugin: SyncPlugin) {
  if (!isSyncPlugin(plugin)) {
    throw new Error(
      `${LIB_NAME}: argument does not properly implement the SyncPlugin interface`,
    );
  }

  try {
    await plugin.load();
  } catch (error) {
    log.error(`Failed to load plugin '${plugin.getPluginId()}':`, error);
    throw error;
  }

  plugin.addSignInChangeListener((userProfile: UserProfile | null) => {
    onPluginSignInChange(plugin, userProfile);
  });

  plugins.push(plugin);

  const syncProfileForPlugin = getSyncProfileForPlugin(plugin.getPluginId());
  if (syncProfileForPlugin) {
    debug &&
      log.debug(
        `Passing saved settings to '${plugin.getPluginId()}' plugin:`,
        syncProfileForPlugin.settings,
      );
    plugin.setSettings(syncProfileForPlugin.settings);

    if (!plugin.isSignedIn()) {
      debug &&
        log.debug(
          `Asking '${plugin.getPluginId()}' plugin to sign-in to remote service...`,
        );
      try {
        await plugin.signIn();
      } catch (error) {
        log.error(
          `Plugin sign-in failed for '${plugin.getPluginId()}':`,
          error,
        );
        throw error;
      }
    }
  }
}

function onPluginSignInChange(
  plugin: SyncPlugin,
  userProfile: UserProfile | null,
) {
  const pluginId = plugin.getPluginId();
  debug &&
    log.debug(
      `Handling sign-in change from '${pluginId}' plugin; user profile:`,
      userProfile,
    );

  if (userProfile) {
    saveSyncProfile({
      pluginId: pluginId,
      userProfile: userProfile,
      settings: plugin.getSettings(),
    });
  } else {
    removeSyncProfile(plugin.getPluginId());
  }
}

export function getSyncProfileForPlugin(
  pluginId: string,
): SyncProfile | undefined {
  return getSyncProfiles().find((existing) => existing.pluginId === pluginId);
}

/** 从缓存中获取设置项 */
export function getSyncProfiles(): SyncProfile[] {
  const settings = db.getSettings();
  return Array.isArray(settings?.syncProfiles) ? settings.syncProfiles : [];
}

export async function saveSyncProfile(profile: SyncProfile) {
  debug && log.debug(`Saving sync profile for '${profile.pluginId}'`);
  const settings = { ...db.getSettings() };
  // Remove any existing instance of the sync profile in case it already exists and we're replacing it.
  settings.syncProfiles = settings.syncProfiles.filter(
    (existing) => existing.pluginId !== profile.pluginId,
  );
  settings.syncProfiles.push(profile);
  await db.saveSettings(settings);
}

export async function removeSyncProfile(pluginId: string) {
  const existingProfileIndex = getSyncProfiles().findIndex(
    (existing) => existing.pluginId === pluginId,
  );
  if (existingProfileIndex === -1) {
    debug &&
      log.debug(
        `Ignoring request to remove sync profile for plugin '${pluginId}'; profile doesn't exist.`,
      );
    return;
  }

  debug && log.debug(`Removing sync profile for '${pluginId}'`);
  const newSettings = { ...db.getSettings() };
  newSettings.syncProfiles = [
    ...newSettings.syncProfiles.slice(0, existingProfileIndex),
    ...newSettings.syncProfiles.slice(existingProfileIndex + 1),
  ];
  await db.saveSettings(newSettings);
}

/**
 * Utility / type guard function for verifying that something implements the SyncPlugin interface.
 */
export function isSyncPlugin(thing: unknown): thing is SyncPlugin {
  if (!thing) {
    return false;
  }

  const candidate = thing as SyncPlugin;

  if (!(candidate.getPluginId instanceof Function)) {
    return false;
  } else if (typeof candidate.getPluginId() !== 'string') {
    return false;
  }

  if (!(candidate.isLoaded instanceof Function)) {
    return false;
  }

  if (!(candidate.load instanceof Function)) {
    return false;
  }

  if (!(candidate.isSignedIn instanceof Function)) {
    return false;
  }

  if (!(candidate.signIn instanceof Function)) {
    return false;
  }

  if (!(candidate.signOut instanceof Function)) {
    return false;
  }

  if (!(candidate.addSignInChangeListener instanceof Function)) {
    return false;
  }

  if (!(candidate.getSettings instanceof Function)) {
    return false;
  }

  if (!(candidate.setSettings instanceof Function)) {
    return false;
  }

  if (!(candidate.getRemoteEntries instanceof Function)) {
    return false;
  }

  if (!(candidate.saveRemoteEntry instanceof Function)) {
    return false;
  }

  if (!(candidate.getRemoteClientRecords instanceof Function)) {
    return false;
  }

  if (!(candidate.saveRemoteClientRecord instanceof Function)) {
    return false;
  }

  if (!(candidate.getMostRecentUploadedEntryTime instanceof Function)) {
    return false;
  }

  return true;
}
