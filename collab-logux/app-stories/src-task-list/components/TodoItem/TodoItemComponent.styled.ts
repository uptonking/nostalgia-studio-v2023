import styled from 'styled-components';

export const ListItemWrapper = styled.div<{ $indent: number }>`
  margin-bottom: 5px;
  font-size: 26px;
  margin-left: ${(props) => `${props.$indent * 30 + 10}px`};
`;
export const ExpandToggle = styled.div<{ $expanded: boolean }>`
  display: inline;
  position: relative;
  top: ${(props) => (props.$expanded ? '-10px' : '10px')};
  svg {
    cursor: pointer;
    transform: ${(props) => (props.$expanded ? 'rotateX(180deg)' : 'none')};
    width: 30px;
    height: 30px;
    transition: 0.5s all ease;
  }
`;
