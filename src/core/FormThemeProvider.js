import React from 'react'
import { ThemeProvider, useTheme } from 'react-jss'
import { ToastContainer } from 'react-toastify'
import defautTheme from './theme'
import 'react-toastify/dist/ReactToastify.css'


const FormThemeProvider = ({ theme, children }) => {
  const [isRoot, setIsRoot] = React.useState(false)
  const [currentTheme, setCurrentTheme] = React.useState()
  const [toastContainerProps, setToastContainerProps] = React.useState({})
  const outerTheme = useTheme()

  React.useEffect(() => {
    if (!outerTheme) {
      setIsRoot(true)
    }
    const parentTheme = outerTheme || defautTheme
    const parsedTheme = {
      sizes: { ...parentTheme.sizes, ...theme.sizes },
      colors: { ...parentTheme.colors, ...theme.colors },
      typography: { ...parentTheme.typography, ...theme.typography },
      breakpoints: { ...parentTheme.breakpoints, ...theme.breakpoints },
      textLabels: { ...parentTheme.textLabels, ...theme.textLabels },
      toastContainerProps: { ...parentTheme.toastContainerProps, ...theme.toastContainerProps },
      ...parentTheme.customValidationFunction,
      ...theme.customValidationFunction,
    }
    setCurrentTheme(parsedTheme)
    setToastContainerProps(parsedTheme.toastContainerProps)
  }, [])

  return (
    currentTheme
      ? <ThemeProvider theme={currentTheme}>
        <React.Fragment>
          {children}
          {isRoot && toastContainerProps && <ToastContainer {...toastContainerProps} />}
        </React.Fragment>
      </ThemeProvider>
      : null
  )
}

export default FormThemeProvider
