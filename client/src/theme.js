import { extendTheme } from '@chakra-ui/react'

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

const theme = extendTheme({ config })

export default theme

// ---------- New Theme -----------

// const customColors = {
//     transparent: 'transparent',
//     black: '#000',
//     white: '#fff',
//     gray: {
//         50: '#000',
//         // ...
//         800: '#121212',
//         900: '#000',
//     },
//     // ...
// };

// const config = {
//     initialColorMode: 'light',
//     useSystemColorMode: false,
// };

// const theme = extendTheme({
//     config,
//     colors: customColors,
// });

// export default theme;
