import styled from 'styled-components';

export const NoteWrapper = styled.div<{ $expanded: boolean }>`
  font-family: 'Caveat', cursive;
  background-color: #eee593;
  color: #000000;
  min-height: 50px;
  max-height: ${(props) => (props.$expanded ? '600px' : '90px')};
  width: 350px;
  margin: 20px;
  padding: 10px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  transition: 0.1s max-height ease-in-out;
`;
export const FoldedNote = styled.div`
  background-color: #dbc968;
  width: 370px;
  height: 30px;
  position: relative;
  left: -10px;
  top: 10px;
  box-shadow: 0px -5px 6px rgba(166, 151, 62, 0.5);
`;
export const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  .title {
    font-family: 'Barlow Condensed', sans-serif;
    text-align: center;
    padding-top: 5px;
    font-size: 18px;
    justify-self: center;
    flex: auto;
  }
`;
export const Pin = styled.div<{ $side: 'left' | 'right' }>`
  width: 20px;
  height: 20px;
  border-radius: 50px;
  background-color: blue;
  margin: 5px 5px;
  justify-self: ${(props) =>
    props.$side === 'left' ? 'flex-start' : 'flex-end'};
  box-shadow: -4px 5px 4px #b59d23;
  -webkit-box-shadow: -4px 5px 4px #b59d23;
  -moz-box-shadow: -4px 5px 4px #b59d23;
`;
export const ContentContainer = styled.div``;
export const ArrowContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  svg {
    cursor: pointer;
    width: 70px;
    height: 35px;
    &:hover {
      transform: rotate(5deg);
      transition: 0.1s all ease-in-out;
    }
  }
`;
