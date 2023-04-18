import { css } from '@linaria/core';

export const appDefaultCss = css`
  :global() {
    .nosedit-app {
      color: var(--nos-palette-gray900, #434c5e);
      .nosedit-header {
        position: sticky;
        top: 0px;
        z-index: 100;
        width: 100%;
        background-color: #fff;
      }

      .nosedit-navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 56px;
        margin-left: 24px;
        margin-right: 24px;
      }

      .nosedit-toolbar {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        height: 42px;
        border-top: 1px solid #e5e9f0;
        border-bottom: 1px solid #e5e9f0;
      }

      .nosedit-body {
        position: relative;
        // z-index: 1;
        display: flex;
        justify-content: center;
        background-color: var(--nos-palette-gray50, #f1f3f5);
      }

      .nos-editor-container {
        width: 100%;
        max-width: 900px;
        min-height: 960px;
        margin-top: 16px;

        background-color: #fff;
      }

      .nos-editable {
        padding-top: 32px;
        padding-left: 64px;
        padding-right: 64px;
      }

      @media only screen and (max-width: 992px) {
        .nos-editable {
          padding-top: 24px;
          padding-left: 40px;
          padding-right: 40px;
        }
      }

      @media only screen and (max-width: 768px) {
        .nos-editable {
          padding-top: 6px;
          padding-left: 12px;
          padding-right: 12px;
        }
      }

      .nos-icon-btn {
        width: 28px;
        height: 28px;
        padding-top: 4px;
        padding-bottom: 4px;
        border: 0;
        border-radius: 6px;
        background-color: transparent;
        color: #4c566a;
        cursor: pointer;
        &:hover {
          background-color: #f3f4f5;
        }
      }
    }

    .fixed {
      position: fixed;
    }
    .relative {
      position: relative;
    }
    .absolute {
      position: absolute;
    }
    .overflow-hidden {
      overflow: hidden;
    }

    .flex-col {
      flex-direction: column;
    }
    .flex-row {
      flex-direction: row;
    }
    .flex {
      display: flex;
    }
    .gap-2 {
      gap: 8px;
    }
    .gap-3 {
      gap: 12px;
    }
    .gap-4 {
      gap: 16px;
    }
  }
`;
