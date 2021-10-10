import classNames from 'classnames';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';

import {
  TOGGLE_SETTINGS_COG_BUTTON,
  TOGGLE_SIDE_PANEL,
} from '../../store/actions-constants';
import { useGlobalContext } from '../../store/global-context';
import {
  resetToDefaultLayoutSettings,
  setDir,
  setHeaderPos,
  setLayout,
  setLogoBg,
  setNavbarBg,
  setSidePanelPos,
  setSidePanelType,
  setSidebarBg,
  setSidebarPos,
  setSidebarType,
  setTheme,
  setSidebarVisibleMode,
} from '../../store/settings/actions';
import { CustomizerItemWithColorCircle } from './CustomizerItemWithColorCircle';
import { CustomizerItemWithSquareRadio } from './CustomizerItemWithSquareRadio';

// todo 给各设置项添加tooltip悬停提示，或提供各设置项的说明文档页
export function SetttingsCustomizer() {
  const {
    state: { settings },
    dispatch,
  } = useGlobalContext();

  const handleToggleSettingsCogButton = useCallback(() => {
    dispatch({ type: TOGGLE_SETTINGS_COG_BUTTON });
  }, [dispatch]);

  const [isQuickSettingsMenuOpen, setIsQuickSettingsMenuOpen] = useState(false);
  const handleToggleQuickSettingsMenu = useCallback(() => {
    setIsQuickSettingsMenuOpen((prev) => !prev);
  }, []);

  /** 切换右侧面板显示模式，overlay时内容会在面板下，dock时内容会在面板左边 */
  const handleToggleSidePanelType = useCallback(() => {
    if (settings.activeSidePanelType === 'overlay') {
      dispatch(setSidePanelType('dock'));
    } else {
      dispatch(setSidePanelType('overlay'));
    }
  }, [dispatch, settings.activeSidePanelType]);

  /** 将界面布局恢复到初始默认状态 */
  const resetSidePanelSettingsToDefault = useCallback(() => {
    dispatch(resetToDefaultLayoutSettings());
  }, [dispatch]);

  const configItemsForLayoutThemes = useMemo(
    () => [
      {
        configTitle: '主题',
        radioName: 'theme-color',
        items: [
          {
            id: 'theme-light',
            desc: 'Light',
            activeClassName: settings.activeTheme === 'light' ? 'active' : '',
            handleConfig: () => {
              dispatch(setTheme('light'));
              dispatch(setLogoBg('skin6'));
              dispatch(setNavbarBg('skin6'));
              dispatch(setSidebarBg('skin6'));
            },
          },
          {
            id: 'theme-dark',
            desc: 'Dark',
            activeClassName: settings.activeTheme === 'dark' ? 'active' : '',
            handleConfig: () => {
              dispatch(setTheme('dark'));
              dispatch(setLogoBg('skin5'));
              dispatch(setNavbarBg('skin5'));
              dispatch(setSidebarBg('skin5'));
            },
          },
        ],
      },
      {
        configTitle: '左侧边栏的类型',
        radioName: 'theme-sidebar',
        items: [
          {
            id: 'sidebar-full',
            desc: 'Full',
            activeClassName:
              settings.activeSidebarType === 'full' ? 'active' : '',
            handleConfig: () => {
              dispatch(setSidebarType('full'));
              dispatch(setSidebarVisibleMode('mini2full'));
            },
          },
          {
            id: 'sidebar-mini',
            desc: 'Mini',
            activeClassName:
              settings.activeSidebarType === 'mini-sidebar' ? 'active' : '',
            handleConfig: () => {
              dispatch(setSidebarType('mini-sidebar'));
              dispatch(setSidebarVisibleMode('full2mini'));
            },
          },
          {
            id: 'sidebar-icon',
            desc: 'Icon',
            activeClassName:
              settings.activeSidebarType === 'iconbar' ? 'active' : '',
            handleConfig: () => {
              dispatch(setSidebarType('iconbar'));
              dispatch(setSidebarVisibleMode('mini2full'));
            },
          },
          {
            id: 'sidebar-overlay',
            desc: 'Overlay',
            activeClassName:
              settings.activeSidebarType === 'overlay' ? 'active' : '',
            handleConfig: () => {
              dispatch(setSidebarType('overlay'));
              dispatch(setSidebarVisibleMode('auto'));
            },
          },
        ],
      },

      {
        configTitle: '左侧边栏内容的位置',
        radioName: 'sidebar-position',
        items: [
          {
            id: 'sidebar-fixed',
            desc: '固定',
            activeClassName:
              settings.activeSidebarPos === 'fixed' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarPos('fixed')),
          },
          {
            id: 'sidebar-absolute',
            desc: '随页面滚动',
            activeClassName:
              settings.activeSidebarPos === 'absolute' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarPos('absolute')),
          },
        ],
      },

      {
        configTitle: '右侧面板的类型',
        radioName: 'theme-side-panel',
        items: [
          {
            id: 'side-panel-overlay',
            desc: 'Overlay',
            activeClassName:
              settings.activeSidePanelType === 'overlay' ? 'active' : '',
            handleConfig: () => dispatch(setSidePanelType('overlay')),
          },
          {
            id: 'side-panel-dock',
            desc: 'Dock',
            activeClassName:
              settings.activeSidePanelType === 'dock' ? 'active' : '',
            handleConfig: () => {
              dispatch(setSidePanelType('dock'));
              dispatch({ type: TOGGLE_SETTINGS_COG_BUTTON });
            },
          },
        ],
      },

      {
        configTitle: '右侧面板内容的位置',
        radioName: 'side-panel-position',
        items: [
          {
            id: 'side-panel-fixed',
            desc: '固定',
            activeClassName:
              settings.activeSidePanelPos === 'fixed' ? 'active' : '',
            handleConfig: () => dispatch(setSidePanelPos('fixed')),
          },
          {
            id: 'side-panel-absolute',
            desc: '随页面滚动',
            activeClassName:
              settings.activeSidePanelPos === 'absolute' ? 'active' : '',
            handleConfig: () => {
              dispatch(setSidePanelPos('absolute'));
              dispatch(setSidePanelType('dock'));
              dispatch({ type: TOGGLE_SETTINGS_COG_BUTTON });
            },
          },
        ],
      },

      {
        configTitle: '表头的位置',
        radioName: 'header-position',
        items: [
          {
            id: 'header-fixed',
            desc: '固定',
            activeClassName:
              settings.activeHeaderPos === 'fixed' ? 'active' : '',
            handleConfig: () => dispatch(setHeaderPos('fixed')),
          },
          {
            id: 'header-absolute',
            desc: '随页面滚动',
            activeClassName:
              settings.activeHeaderPos === 'absolute' ? 'active' : '',
            handleConfig: () => dispatch(setHeaderPos('absolute')),
          },
        ],
      },

      {
        configTitle: '整体布局',
        radioName: 'theme-layout',
        items: [
          {
            id: 'theme-full',
            desc: '全宽',
            activeClassName: settings.activeLayout === 'full' ? 'active' : '',
            handleConfig: () => dispatch(setLayout('full')),
          },
          {
            id: 'theme-boxed',
            desc: '定宽',
            activeClassName: settings.activeLayout === 'boxed' ? 'active' : '',
            handleConfig: () => {
              dispatch(setLayout('boxed'));
              dispatch(setSidePanelPos('absolute'));
              dispatch(setSidePanelType('dock'));
            },
          },
        ],
      },
      {
        configTitle: 'Direction',
        radioName: 'theme-dir',
        items: [
          {
            id: 'theme-full',
            desc: 'LTR',
            activeClassName: settings.activeDir === 'ltr' ? 'active' : '',
            handleConfig: () => dispatch(setDir('ltr')),
          },
          {
            id: 'theme-rtl',
            desc: 'RTL',
            activeClassName: settings.activeDir === 'rtl' ? 'active' : '',
            handleConfig: () => dispatch(setDir('rtl')),
          },
        ],
      },
    ],
    [
      dispatch,
      settings.activeDir,
      settings.activeHeaderPos,
      settings.activeLayout,
      settings.activeSidePanelPos,
      settings.activeSidePanelType,
      settings.activeSidebarPos,
      settings.activeSidebarType,
      settings.activeTheme,
    ],
  );

  const configItemsForColors = useMemo(
    () => [
      {
        configTitle: 'Logo背景色',
        items: [
          {
            bgColor: 'skin1',
            activeClassName: settings.activeLogoBg === 'skin1' ? 'active' : '',
            handleConfig: () => dispatch(setLogoBg('skin1')),
          },
          {
            bgColor: 'skin2',
            activeClassName: settings.activeLogoBg === 'skin2' ? 'active' : '',
            handleConfig: () => dispatch(setLogoBg('skin2')),
          },
          {
            bgColor: 'skin3',
            activeClassName: settings.activeLogoBg === 'skin3' ? 'active' : '',
            handleConfig: () => dispatch(setLogoBg('skin3')),
          },
          {
            bgColor: 'skin4',
            activeClassName: settings.activeLogoBg === 'skin4' ? 'active' : '',
            handleConfig: () => dispatch(setLogoBg('skin4')),
          },
          {
            bgColor: 'skin5',
            activeClassName: settings.activeLogoBg === 'skin5' ? 'active' : '',
            handleConfig: () => dispatch(setLogoBg('skin5')),
          },
          {
            bgColor: 'skin6',
            activeClassName: settings.activeLogoBg === 'skin6' ? 'active' : '',
            handleConfig: () => dispatch(setLogoBg('skin6')),
          },
        ],
      },
      {
        configTitle: 'Navbar导航条背景色',
        items: [
          {
            bgColor: 'skin1',
            activeClassName:
              settings.activeNavbarBg === 'skin1' ? 'active' : '',
            handleConfig: () => dispatch(setNavbarBg('skin1')),
          },
          {
            bgColor: 'skin2',
            activeClassName:
              settings.activeNavbarBg === 'skin2' ? 'active' : '',
            handleConfig: () => dispatch(setNavbarBg('skin2')),
          },
          {
            bgColor: 'skin3',
            activeClassName:
              settings.activeNavbarBg === 'skin3' ? 'active' : '',
            handleConfig: () => dispatch(setNavbarBg('skin3')),
          },
          {
            bgColor: 'skin4',
            activeClassName:
              settings.activeNavbarBg === 'skin4' ? 'active' : '',
            handleConfig: () => dispatch(setNavbarBg('skin4')),
          },
          {
            bgColor: 'skin5',
            activeClassName:
              settings.activeNavbarBg === 'skin5' ? 'active' : '',
            handleConfig: () => dispatch(setNavbarBg('skin5')),
          },
          {
            bgColor: 'skin6',
            activeClassName:
              settings.activeNavbarBg === 'skin6' ? 'active' : '',
            handleConfig: () => dispatch(setNavbarBg('skin6')),
          },
        ],
      },
      {
        configTitle: 'Sidebar左侧边栏背景色',
        items: [
          {
            bgColor: 'skin1',
            activeClassName:
              settings.activeSidebarBg === 'skin1' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarBg('skin1')),
          },
          {
            bgColor: 'skin2',
            activeClassName:
              settings.activeSidebarBg === 'skin2' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarBg('skin2')),
          },
          {
            bgColor: 'skin3',
            activeClassName:
              settings.activeSidebarBg === 'skin3' ? 'active' : '',

            handleConfig: () => dispatch(setSidebarBg('skin3')),
          },
          {
            bgColor: 'skin4',
            activeClassName:
              settings.activeSidebarBg === 'skin4' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarBg('skin4')),
          },
          {
            bgColor: 'skin5',
            activeClassName:
              settings.activeSidebarBg === 'skin5' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarBg('skin5')),
          },
          {
            bgColor: 'skin6',
            activeClassName:
              settings.activeSidebarBg === 'skin6' ? 'active' : '',
            handleConfig: () => dispatch(setSidebarBg('skin6')),
          },
        ],
      },
    ],
    [
      dispatch,
      settings.activeLogoBg,
      settings.activeNavbarBg,
      settings.activeSidebarBg,
    ],
  );

  const handleToggleSidePanel = useCallback(() => {
    dispatch({ type: TOGGLE_SIDE_PANEL });
  }, [dispatch]);

  const memoedResultJsx = useMemo(
    () => (
      <aside
        className={classNames('customizer', {
          'show-service-panel': settings.isSidePanelShown,
        })}
        id='customizer'
      >
        {
          // 浮动设置按钮，点击可切换显示隐藏右侧设置面板

          settings.isSettingsCogButtonShown && (
            <span
              className='service-panel-toggle text-white cursor-pointer'
              onClick={handleToggleSidePanel}
            >
              <i className='fa fa-spin fa-cog' />
            </span>
          )
        }
        <PerfectScrollbar>
          <div className='customizer-body'>
            <div className='my-3 px-3'>
              <h4 className='fnt-medium m-0'>
                快速设置
                <span className='pl-4'>
                  <ButtonDropdown
                    isOpen={isQuickSettingsMenuOpen}
                    toggle={handleToggleQuickSettingsMenu}
                  >
                    <DropdownToggle caret={false}>
                      <i className='fa fa-cog' />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={handleToggleSettingsCogButton}>
                        显示或隐藏浮动设置按钮
                      </DropdownItem>
                      <DropdownItem onClick={handleToggleSidePanelType}>
                        设置面板显示为固定dock模式
                      </DropdownItem>
                      <DropdownItem onClick={resetSidePanelSettingsToDefault}>
                        设置面板恢复默认值
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>更多设置(todo)</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </span>
                {/* 关闭右侧面板的图标 */}
                <span
                  className='pull-right cursor-pointer'
                  onClick={handleToggleSidePanel}
                >
                  <i className='fa fa-close' />
                </span>
              </h4>
            </div>

            {configItemsForLayoutThemes.map((item) => {
              return (
                <CustomizerItemWithSquareRadio
                  key={item.configTitle}
                  {...item}
                />
              );
            })}

            {configItemsForColors.map((item) => {
              return (
                <CustomizerItemWithColorCircle
                  key={item.configTitle}
                  {...item}
                />
              );
            })}
          </div>
        </PerfectScrollbar>
      </aside>
    ),
    [
      configItemsForColors,
      configItemsForLayoutThemes,
      handleToggleQuickSettingsMenu,
      handleToggleSettingsCogButton,
      handleToggleSidePanel,
      handleToggleSidePanelType,
      isQuickSettingsMenuOpen,
      resetSidePanelSettingsToDefault,
      settings.isSettingsCogButtonShown,
      settings.isSidePanelShown,
    ],
  );

  return memoedResultJsx;
}

export default SetttingsCustomizer;
