import styled from 'styled-components';

export const CheckboxWrapper = styled.div`
  display: inline;
  .label {
    display: block;

    span {
      position: absolute;
      margin-top: 2px;
    }
  }
  .checkbox {
    position: relative;
    display: inline-block;
    width: 90%;
    height: 30px;
    overflow: hidden;
  }
  .checkbox-input {
    width: 40px;
    height: 40px;
    position: absolute;
    opacity: 0;
  }
  .checkbox-input:checked + label svg g path {
    stroke-dashoffset: 0;
  }
  .path1 {
    stroke-dasharray: 200;
    stroke-dashoffset: 200;
    transition: 0.5s all;
  }
`;
export const TextWrapper = styled.span<{ $done: boolean }>`
  text-decoration: ${(props) => (props.$done ? 'line-through 1px' : 'none')};
`;
