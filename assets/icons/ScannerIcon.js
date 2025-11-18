import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
const ScannerIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={24}
    height={24}
    viewBox="0 0 0.25 0.229"
    {...props}
  >
    <Path
      d="M.007 0A.007.007 0 0 0 0 .007v.216c0 .003.003.006.007.006h.058V.216H.021A.006.006 0 0 1 .015.21V.02C.015.016.017.013.02.013h.044V0Zm.178 0v.013h.044c.004 0 .006.003.006.006V.21A.006.006 0 0 1 .23.216H.185V.23h.058A.007.007 0 0 0 .25.223V.007A.007.007 0 0 0 .243 0ZM.029.068v.094h.018V.068zm.036 0v.094h.018V.068zm.102 0v.094h.018V.068zm.036 0v.094h.018V.068zm-.101 0V.16h.046V.068z"
      style={{
        fill: '#1a1a1a',
        strokeWidth: 0.00329645,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        paintOrder: 'markers fill stroke',
      }}
    />
  </Svg>
);
export default ScannerIcon;
