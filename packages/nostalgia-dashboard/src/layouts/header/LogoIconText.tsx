import * as React from 'react';
import { Link } from 'react-router-dom';
import { NavbarBrand } from 'reactstrap';

export function LogoIconText(props) {
  const {
    logoText,
    activeLogoBg,
    handleToggleWholeSidebar,
    handleToggleHeaderMenuContents,
    logodarkicon,
    logolighticon,
  } = props;

  return (
    //  当视口宽度 < 768px时，左边只显示汉堡菜单，logo会显示在导航条中间
    <div id='logobg' className='navbar-header' data-logobg={activeLogoBg}>
      <span
        className='nav-toggler d-block d-md-none cursor-pointer'
        onClick={handleToggleWholeSidebar}
      >
        <i className='fa fa-bars' />
      </span>

      {/* logo图片和title */}
      {/* a元素内部不能有a */}
      <NavbarBrand tag='span'>
        <b className='logo-icon'>
          <img src={logodarkicon} alt='homepage' className='dark-logo' />
          <img src={logolighticon} alt='homepage' className='light-logo' />
        </b>
        <Link to='/'>
          <span className='logo-text text-body'>{logoText}</span>
        </Link>
      </NavbarBrand>

      {/* 当视口宽度 < 768px时，右边显示更多...图标 */}
      <span
        className='topbartoggler d-block d-md-none cursor-pointer'
        onClick={handleToggleHeaderMenuContents}
      >
        <i className='fa fa-ellipsis-h' />
      </span>
    </div>
  );
}

export default LogoIconText;
