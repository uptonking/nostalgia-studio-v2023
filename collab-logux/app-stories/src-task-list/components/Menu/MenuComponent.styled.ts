import styled from 'styled-components';

export const MenuWrapper = styled.div`
  height: calc(100% - 60px);
  width: 300px;
  margin: 0 auto;
  position: absolute;
  right: 0;
  top: 60px;
  z-index: 2;
  overflow: hidden;
`;
export const MenuCard = styled.div<{ $isOpen: boolean }>`
  padding: 16px;
  width: 100%;
  height: 100%;
  position: relative;
  right: ${({ $isOpen }) => ($isOpen ? 0 : '-550px')};
  transition: right 0.7s ease-in-out;
  background-color: #fffbf2;
  color: #684f0f;
`;
export const MenuItem = styled.div<{
  $clickable?: boolean;
  $createNote?: boolean;
  $editNote?: boolean;
}>`
  padding: 10px 0;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'initial')};

  &:hover {
    color: ${({ $createNote, $editNote }) =>
      $createNote ? '#FDC338' : $editNote ? '#2139ab' : '#684F0F'};
  }
`;
export const ToggleLabel = styled.span`
  padding-left: 5px;
  position: relative;
  top: 2px;
`;
export const IconLabel = styled.span`
  padding-left: 5px;
  position: relative;
  bottom: 8px;
`;
export const IconWrapper = styled.div`
  width: 40px;
  display: inline-block;
  svg {
    width: 30px;
  }
`;
