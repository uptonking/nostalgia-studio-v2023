import classNames from 'classnames';
import * as React from 'react';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  Col,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
  Progress,
  Row,
  UncontrolledCarousel,
  UncontrolledDropdown,
} from 'reactstrap';

import logodarkicon from '../../assets/images/logo-icon.png';
import logolighticon from '../../assets/images/logo-light-icon.png';
import profilephoto from '../../assets/images/users/1.jpg';
import {
  AUTHENTICATE_FALSE,
  LOGOUT,
  SIDEBAR_VISIBLE_MODE,
  TOGGLE_SETTINGS_COG_BUTTON,
} from '../../store/actions-constants';
import { useGlobalContext } from '../../store';
import {
  resetToDefaultLayoutSettings,
  setLogoText,
  setSidebarType,
  setSidebarVisibleMode,
} from '../../store/settings/actions';
import LogoIconText from './LogoIconText';
import * as data from './data';
import * as authService from '../../services/authService';
import { logoutRepo } from '../../store/repo/actions';
import defaultSettings from '../../../config/defaultSettings';

export function Header() {
  const navigate = useNavigate();

  const {
    state: { settings, user },
    dispatch,
  } = useGlobalContext();

  const { pathname } = useLocation();

  // 仅用于小屏幕
  const [isHeaderMenuContentsShown, setIsHeaderMenuContentsShown] =
    useState(false);
  /** 在小屏幕，切换顶部导航条的2种状态：隐藏所有菜单项；在导航条下面显示一个单独的菜单横条 */
  const handleMobileToggleHeaderMenuContents = useCallback(() => {
    setIsHeaderMenuContentsShown((prev) => !prev);
  }, []);

  /** 在小屏幕，切换侧边栏的2种状态：显示；隐藏 */
  const handleToggleWholeSidebar = useCallback(() => {
    console.log(';;handleToggleWholeSidebar');

    settings.sidebarVisibleMode !== 'visible'
      ? dispatch(setSidebarVisibleMode('visible'))
      : dispatch(setSidebarVisibleMode('auto'));
  }, [dispatch, settings.sidebarVisibleMode]);

  /** 在大屏幕，切换左边侧边栏的多种模式:
   * 对于full/icon，切换到mini；
   * 对于mini，切换到full；
   * 对于overlay，切换显示隐藏；
   */
  const handleSwitchSidebarMode = useCallback(() => {
    switch (settings.activeSidebarType) {
      case 'full': {
        dispatch(setSidebarType('mini-sidebar'));
        if (window.innerWidth >= 1170) {
          dispatch(setSidebarVisibleMode('full2mini'));
        }
        break;
      }
      case 'iconbar': {
        dispatch(setSidebarType('mini-sidebar'));
        dispatch(setSidebarVisibleMode('auto'));
        break;
      }

      case 'mini-sidebar': {
        if (window.innerWidth < 767) {
          // 小屏幕上不改变侧边栏类型，只切换显示隐藏2种状态
          settings.sidebarVisibleMode !== 'visible'
            ? dispatch(setSidebarVisibleMode('visible'))
            : dispatch(setSidebarVisibleMode('auto'));
          return;
        }

        if (window.innerWidth >= 767 && window.innerWidth < 1170) {
          dispatch(setSidebarType('full'));
          dispatch(setSidebarVisibleMode('mini2full'));
          return;
        }

        // window.innerWidth >= 1170 大屏幕上mini会变full
        dispatch(setSidebarType('full'));
        dispatch(setSidebarVisibleMode('auto'));
        break;
      }

      case 'overlay': {
        settings.sidebarVisibleMode !== 'visible'
          ? dispatch(setSidebarVisibleMode('visible'))
          : dispatch(setSidebarVisibleMode('auto'));
        break;
      }
      default:
    }
  }, [dispatch, settings.activeSidebarType, settings.sidebarVisibleMode]);

  const handleLogout = useCallback(() => {
    const ajaxLogout = async () => {
      const resData: any = await authService.logoutAccount();

      if (resData?.code === 0) {
        localStorage.removeItem('curuser');
        dispatch({ type: LOGOUT });
        dispatch(logoutRepo());
        dispatch({ type: AUTHENTICATE_FALSE });
        dispatch(resetToDefaultLayoutSettings());

        // navigate('/login');
        navigate('/');
      }
    };

    ajaxLogout();
  }, [dispatch, navigate]);

  /** 将界面布局恢复到初始默认状态 */
  const resetSidePanelSettingsToDefault = useCallback(() => {
    dispatch(resetToDefaultLayoutSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!pathname.includes('/repo/') && !pathname.includes('/pages/')) {
      dispatch(setLogoText({ logoText: defaultSettings.title }));
    }
  }, [dispatch, pathname]);

  const memoedResultJsx = useMemo(
    () => (
      <header
        className='topbar navbarbg'
        data-navbarbg={settings.activeNavbarBg}
      >
        <Navbar
          className={classNames(
            'top-navbar ',
            settings.activeNavbarBg === 'skin6'
              ? 'navbar-light'
              : 'navbar-dark',
          )}
          expand='md'
        >
          {/* logo部分，顶部导航条左侧背景色与侧边栏背景色相同，易混淆；
          小屏幕时会显示这里的汉堡菜单 */}
          <LogoIconText
            logoText={settings.logoText}
            activeLogoBg={settings.activeLogoBg}
            handleToggleWholeSidebar={handleToggleWholeSidebar}
            handleToggleHeaderMenuContents={
              handleMobileToggleHeaderMenuContents
            }
            logodarkicon={logodarkicon}
            logolighticon={logolighticon}
          />

          <Collapse
            className='navbarbg'
            isOpen={isHeaderMenuContentsShown}
            navbar
            data-navbarbg={settings.activeNavbarBg}
          >
            {/* 顶部导航条左边部分，包括全宽菜单、下单菜单 */}
            <Nav className='float-left' navbar>
              <NavItem>
                <NavLink
                  // tag='span'
                  className='d-none d-md-block cursor-pointer'
                  onClick={handleSwitchSidebarMode}
                >
                  <i className='fa fa-bars' />
                </NavLink>
              </NavItem>

              {/* 全宽导航菜单 */}
              <UncontrolledDropdown nav inNavbar className='mega-dropdown'>
                <DropdownToggle nav>
                  Mega <i className='fa fa-angle-down' />
                </DropdownToggle>
                <DropdownMenu>
                  <Row>
                    {/* 共4列，第1列时轮播图片 */}
                    <Col xs='12' sm='12' md='12' lg='3'>
                      <h5 className='mb-3 text-uppercase'>Carousel</h5>
                      <UncontrolledCarousel items={data.items} />
                    </Col>
                    {/* 第2列是进度条比较 */}
                    <Col xs='12' sm='12' md='12' lg='3'>
                      <h5 className='mb-3 text-uppercase'>Progress</h5>
                      <div className='d-flex no-block align-items-center mb-2'>
                        <span>Sales</span>
                        <div className='ml-auto'>
                          <span className='text-primary'>
                            <i className='mdi mdi-chart-areaspline' />
                          </span>
                        </div>
                      </div>
                      <Progress className='mb-3' animated value={2 * 5} />
                      <div className='d-flex no-block align-items-center mb-2'>
                        <span>Marketing</span>
                        <div className='ml-auto'>
                          <span className='text-success'>
                            <i className='mdi mdi-chart-line' />
                          </span>
                        </div>
                      </div>
                      <Progress
                        className='mb-3'
                        animated
                        color='success'
                        value='25'
                      />
                      <div className='d-flex no-block align-items-center mb-2'>
                        <span>Accouting</span>
                        <div className='ml-auto'>
                          <span className='text-danger'>
                            <i className='mdi mdi-chart-arc' />
                          </span>
                        </div>
                      </div>
                      <Progress
                        className='mb-3'
                        animated
                        color='danger'
                        value={50}
                      />
                      <div className='d-flex no-block align-items-center mb-2'>
                        <span>Sales Ratio</span>
                        <div className='ml-auto'>
                          <span className='text-warning'>
                            <i className='mdi mdi-chart-pie' />
                          </span>
                        </div>
                      </div>
                      <Progress
                        className='mb-3'
                        animated
                        color='warning'
                        value={70}
                      />
                    </Col>
                    {/* 第3列是简单表单 */}
                    <Col xs='12' sm='12' md='12' lg='3'>
                      <h5 className='mb-3 text-uppercase'>Contact Us</h5>
                      <Form>
                        <FormGroup>
                          <Input
                            type='text'
                            name='name'
                            id='textname'
                            placeholder='Enter Name Here'
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type='email'
                            name='email'
                            id='exampleEmail'
                            placeholder='Enter Email Here'
                          />
                        </FormGroup>
                        <FormGroup>
                          <Input
                            type='textarea'
                            name='text'
                            id='exampleText'
                            placeholder='Message'
                          />
                        </FormGroup>
                        <Button color='primary'>Submit</Button>
                      </Form>
                    </Col>
                    {/* 第4列是打勾的列表 */}
                    <Col xs='12' sm='12' md='12' lg='3'>
                      <h5 className='mb-3 text-uppercase'>List Style</h5>
                      <ListGroup flush>
                        <ListGroupItem
                          tag='a'
                          href=''
                          className='border-0 pl-0 text-dark pt-0'
                        >
                          <i className='fa fa-check text-success mr-2' />
                          Cras justo odio
                        </ListGroupItem>
                        <ListGroupItem
                          tag='a'
                          href=''
                          className='border-0 pl-0 text-dark pt-0'
                        >
                          <i className='fa fa-check text-success mr-2' />
                          Dapibus ac facilisis in
                        </ListGroupItem>
                        <ListGroupItem
                          tag='a'
                          href=''
                          className='border-0 pl-0 text-dark pt-0'
                        >
                          <i className='fa fa-check text-success mr-2' />
                          Morbi leo risus
                        </ListGroupItem>
                        <ListGroupItem
                          tag='a'
                          href=''
                          className='border-0 pl-0 text-dark pt-0'
                        >
                          <i className='fa fa-check text-success mr-2' />
                          Porta ac consectetur ac
                        </ListGroupItem>
                        <ListGroupItem
                          tag='a'
                          href=''
                          className='border-0 pl-0 text-dark pt-0'
                        >
                          <i className='fa fa-check text-success mr-2' />
                          Vestibulum at eros
                        </ListGroupItem>
                      </ListGroup>
                    </Col>
                  </Row>
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* 下拉菜单 */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav>
                  Create New <i className='fa fa-angle-down' />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem>Option 1</DropdownItem>
                  <DropdownItem>Option 2</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>Reset</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>

            {/* 顶部导航条右边部分，包括通知、消息、个人中心 */}
            <Nav className='ml-auto float-right' navbar>
              {/* 下拉菜单 通知 notification */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <i className='mdi mdi-bell font-24' />
                </DropdownToggle>
                <DropdownMenu right className='mailbox'>
                  <span className='with-arrow'>
                    <span className='bg-primary' />
                  </span>
                  <div className='d-flex drop-title no-block align-items-center p-3 bg-primary text-white mb-2'>
                    <div className=''>
                      <h4 className='mb-0'>4 New</h4>
                      <p className='mb-0'>Notifications</p>
                    </div>
                  </div>
                  <div className='message-center notifications'>
                    {data.notifications.map((notification, index) => {
                      return (
                        <span className='message-item' key={index}>
                          <span
                            className={
                              'btn btn-circle btn-' + notification.iconbg
                            }
                          >
                            <i className={notification.iconclass} />
                          </span>
                          <div className='mail-contnet'>
                            <h5 className='message-title'>
                              {notification.title}
                            </h5>
                            <span className='mail-desc'>
                              {notification.desc}
                            </span>
                            <span className='time'>{notification.time}</span>
                          </div>
                        </span>
                      );
                    })}
                  </div>
                  <a className='nav-link text-center mb-1 text-dark' href=';'>
                    <strong>Check all notifications</strong>{' '}
                    <i className='fa fa-angle-right' />
                  </a>
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* 下拉菜单 聊天消息       */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <i className='font-24 mdi mdi-comment-processing' />
                </DropdownToggle>
                <DropdownMenu right className='mailbox'>
                  <span className='with-arrow'>
                    <span className='bg-danger' />
                  </span>
                  <div className='d-flex drop-title no-block align-items-center p-3 bg-danger text-white mb-2'>
                    <div className=''>
                      <h4 className='mb-0'>5 New</h4>
                      <p className='mb-0'>Messages</p>
                    </div>
                  </div>
                  <div className='message-center message-body'>
                    {/* <!-- Message --> */}
                    {data.messages.map((message, index) => {
                      return (
                        <span className='message-item' key={index}>
                          <span className='user-img'>
                            <img
                              src={message.image}
                              alt='user'
                              className='rounded-circle'
                              width=''
                            />
                            <span
                              className={
                                'profile-status pull-right ' + message.status
                              }
                            />
                          </span>
                          <div className='mail-contnet'>
                            <h5 className='message-title'>{message.title}</h5>
                            <span className='mail-desc'>{message.desc}</span>
                            <span className='time'>{message.time}</span>
                          </div>
                        </span>
                      );
                    })}
                  </div>
                  <span className='nav-link text-center link text-dark'>
                    <b>See all e-Mails</b> <i className='fa fa-angle-right' />
                  </span>
                </DropdownMenu>
              </UncontrolledDropdown>

              {/* 下拉菜单 个人中心         */}
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret className='pro-pic'>
                  <span className='pr-2'>
                    {user.user?.displayName ||
                      user.user?.username ||
                      'Guest 游客'}
                  </span>
                  <img
                    src={profilephoto}
                    alt='user'
                    className='rounded-circle'
                    width='31'
                  />
                </DropdownToggle>
                <DropdownMenu right className='user-dd'>
                  <span className='with-arrow'>
                    <span className='bg-primary' />
                  </span>
                  <div className='d-flex no-block align-items-center p-3 bg-primary text-white mb-2'>
                    <div className=''>
                      <img
                        src={profilephoto}
                        alt='user'
                        className='rounded-circle'
                        width='60'
                      />
                    </div>
                    <div className='ml-2'>
                      <h4 className='mb-0'>Steave Jobs</h4>
                      <p className=' mb-0'>varun@gmail.com</p>
                    </div>
                  </div>
                  <DropdownItem>
                    <i className='ti-user mr-1 ml-1' /> My Account
                  </DropdownItem>
                  <DropdownItem>
                    <i className='ti-wallet mr-1 ml-1' /> My Balance
                  </DropdownItem>
                  <DropdownItem>
                    <i className='ti-email mr-1 ml-1' /> Inbox
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={resetSidePanelSettingsToDefault}>
                    <i className='ti-settings mr-1 ml-1' /> 重置右侧设置面板
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>
                    <i className='ti-settings mr-1 ml-1' /> Account Settings
                  </DropdownItem>
                  {/* <DropdownItem href='/pages/login'> */}
                  <DropdownItem onClick={handleLogout}>
                    <i className='fa fa-power-off mr-1 ml-1' /> Logout 退出
                  </DropdownItem>
                  <DropdownItem divider />
                  <Button
                    color='success'
                    className='btn-rounded ml-3 mb-2 mt-2'
                  >
                    View Profile
                  </Button>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </header>
    ),
    [
      settings.activeNavbarBg,
      settings.logoText,
      settings.activeLogoBg,
      handleToggleWholeSidebar,
      handleMobileToggleHeaderMenuContents,
      isHeaderMenuContentsShown,
      handleSwitchSidebarMode,
      user.user?.displayName,
      user.user?.username,
      resetSidePanelSettingsToDefault,
      handleLogout,
    ],
  );

  return memoedResultJsx;
}

export default Header;
