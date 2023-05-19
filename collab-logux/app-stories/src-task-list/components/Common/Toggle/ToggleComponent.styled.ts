import styled from 'styled-components';

export const ToggleWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 25px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #e6e5e2;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
    box-shadow: inset 0px 0px 2px #bebcb5;
  }

  .slider:before {
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: rgb(63, 73, 118);
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #fdf2d8;
    box-shadow: inset 0px 0px 2px #ad9251;
  }

  input:checked + .slider:before {
    -webkit-transform: translateX(15px);
    -ms-transform: translateX(15px);
    transform: translateX(15px);
    background-color: #fdc338;
  }
`;
