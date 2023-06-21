import { type Revision, RevisionManager, Session } from '../../editing';
import { applyChange } from '../../state';
import { DEFAULT_REVISION_ID } from '../../utils/constants';
import { CorePlugin, type CorePluginOptions } from '../plugin-core';

/**
 * fundamental plugin for undo/redo/collaboration
 */
export class EditSessionPlugin extends CorePlugin {
  static pluginKey = 'WTBL_EDIT_SESSION';

  static getters = ['getSession'] as const;

  session: Session;

  constructor(props: CorePluginOptions) {
    super(props);
    const { stateObserver, dispatchToCorePlugins } = props;

    const recordChanges = stateObserver.recordChanges.bind(stateObserver);

    this.session = new Session({
      revisions: new RevisionManager<Revision>({
        initialOperationId: DEFAULT_REVISION_ID,
        applyOperation: (revision: Revision) => {
          const commands = revision.commands.slice();
          if (commands.length) {
            // ? commands often empty
            const { changes } = recordChanges(() => {
              for (const command of commands) {
                dispatchToCorePlugins(command);
              }
            });
            revision.setChanges(changes);
          } else {
            for (let i = 0; i < revision.changes.length; i++) {
              const change = revision.changes[i];
              applyChange(change, 'after');
            }
          }
        },
        revertOperation: (revision: Revision) => {
          for (let i = revision.changes.length - 1; i >= 0; i--) {
            const change = revision.changes[i];
            applyChange(change, 'before');
          }
        },
      }),
    });

    this.init(props);
  }

  private init(props: CorePluginOptions) {
    // init session and events
    // this.session.on("remote-revision-received", this, this.onRemoteRevisionReceived);
    this.session.on('_SES_REVISION_UNDONE', ({ commands }) => {
      this.dispatch('UNDO', { commands });
      this.finalize();
    });
    this.session.on('_SES_REVISION_REDONE', ({ commands }) => {
      this.dispatch('REDO', { commands });
      this.finalize();
    });
    this.session.on('_SES_COLLAB_EVENT_RECEIVED', () => {
      // trigger view update
      props.emitStateUpdate();
    });

    // join collab editing
    this.session.join(props.client);
  }

  getSession() {
    return this.session;
  }
}

