
type GDriveInfoType = {
  currentUser: {
    firstName: string;
    lastName: string;
    email: string;
  }
  settings: {
    remoteFolderLink: string;
    remoteFolderName: string;
  }
  email: string | null;
  loginError: any;
}

type SyncInfoType = {
  enabled: boolean;
  inProgress: boolean;
  message: any;
}

export type AppMainStateType = {
  editingTodo: any;
  activeProfileName: string | any;
  modal: null | 'please-wait' | 'add-todo-type' | 'delete-todo-type' | 'error-modal' | 'reset-warning' | 'sync-settings/main-menu' | 'sync-settings/gdrive' | 'sync-settings/gdrive/sign-in' | 'sync-settings/gdrive/sign-in/in-progress' | 'sync-settings/gdrive/sign-in/failed' | 'preferences';
  waitModalMessage: any;
  errorMsg: any;
  gdrive: GDriveInfoType;
  sync: SyncInfoType;
};
