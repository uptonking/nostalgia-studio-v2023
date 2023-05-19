import styled from 'styled-components';

export const StyledHeader = styled.header`
  background-color: #3f4976;
  color: white;
  height: 60px;
  font-family: 'Caveat', cursive;
  font-size: 40px;
`;
export const HeaderTitle = styled.div`
  text-align: center;
  height: 100%;
`;

export const SettingsIconWrapper = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  right: 20px;
  top: 10px;
  svg {
    width: 35px;
    height: 35px;
    cursor: pointer;
    opacity: 0.8;
    transform: ${({ $isOpen }) =>
      $isOpen ? 'rotate(316deg)' : 'rotate(100deg)'};
    transition: transform 0.7s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }
`;
export const HeaderDecoration = styled.div`
  .line1 {
    position: absolute;
    top: 6px;
    left: -35px;
    width: 90px;
    height: 12px;
    background-color: #fdc338;
    transform: rotate(-45deg);
  }
  .line2 {
    position: absolute;
    top: 21px;
    left: -22px;
    width: 90px;
    height: 12px;
    background-color: #fdc338;
    transform: rotate(-45deg);
  }
`;
