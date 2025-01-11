// styles/GlobalStyle.ts
import styled, {  } from 'styled-components';

// export const GlobalStyle = createGlobalStyle`
//   body {
//     background-color: ${(props) => props.theme.body};
//     color: ${(props) => props.theme.text};
//   },
//   button {
//     background-color:
//   }
// `;
export const Btn = styled.button`
background-color: ${(props) => props.theme.inBody};
color: ${(props) => props.theme.inText};
transition :0.10s;
&:hover {
    color:${(props) => props.theme.text};
    border: 1px solid ${(props) => props.theme.intext};
    background-color:${(props) => props.theme.body} ;
}
`;
export const Typo = styled.h1`
  color: ${(props) => props.theme.inBody};
  `

export const P = styled.p`
  &:hover {
      color:${(props) => props.theme.inBody}; ;
  };
  `;


 export const Span = styled.a`
 text-decoration: underline;
 color: ${(props) => props.theme.textLink};
  &:hover {
    color:${(props) => props.theme.inBody}; ;
  }
`;