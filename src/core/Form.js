import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'throttle-debounce'
import withStyles from 'react-jss'
import classNames from 'classnames'
import {
  initiateFormFields,
  processField,
  updateFieldsRequirements,
  getValues,
} from './helpers'

/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/no-did-update-set-state */

const FieldsContext = React.createContext({})
const SetValueContext = React.createContext(() => {})

export const FormConsumer = ({ children }) => (
  <FieldsContext.Consumer>
    {fieldsData =>
      <SetValueContext.Consumer>
        {setValue => children({ fieldsData, setValue })}
      </SetValueContext.Consumer>
    }
  </FieldsContext.Consumer>
)

FormConsumer.propTypes = {
  children: PropTypes.func.isRequired,
}

/**
 * This form component's Creates new context with defined fields that are
 * avaliable for all field items inside.
 */
class Form extends React.Component {
  constructor(props) {
    super(props)
    const requiredFields = props.allRequired ? props.fields : props.required
    this.callbackOnChangeThrottled = debounce(500, props.callbackOnChange)
    this.state = {
      fieldsData: initiateFormFields(props.fields, requiredFields),
    }
  }

  setValue(name, value, required, options) {
    const { fields, allRequired, callbackOnChange, isMultiFormInput, theme } = this.props

    if (!name) {
      // If no field name is provided, reset whole form
      const requiredFields = allRequired ? fields : required
      this.setState({
        fieldsData: initiateFormFields(fields, requiredFields),
      })
    } else {
      this.setState(prevState => {
        const fieldsData = {
          ...prevState.fieldsData,
          ...processField(
            name,
            value,
            required,
            options,
            theme.textLabels,
            theme.customValidationFunction
          ),
        }
        if (callbackOnChange) {
          // If callbackOnChange prop is present, run it on every form change,
          // except the initial load. When isMultiFormInput prop is present,
          // run it also on Initial load.
          const formIsInitiated = Object.entries(prevState.fieldsData)
            .every(item => typeof item[1].value === 'undefined')
          if (!formIsInitiated || isMultiFormInput) {
            this.callbackOnChangeThrottled(getValues(fieldsData), name)
          }
        }
        return { fieldsData }
      })
    }
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.required && this.props.required) &&
    (prevProps.required.toString() !== this.props.required.toString()) &&
    !this.props.allRequired) {
      this.setState({ fieldsData: updateFieldsRequirements(this.state.fieldsData, this.props.required) })
    }
  }

  render() {
    const { className, classes, component, isMultiFormInput } = this.props
    const Component = isMultiFormInput ? 'div' : component
    return (
      <Component className={classNames(classes.form, { [className]: className })}>
        <FieldsContext.Provider value={this.state.fieldsData}>
          <SetValueContext.Provider value={this.setValue.bind(this)}>
            {this.props.children}
          </SetValueContext.Provider>
        </FieldsContext.Provider>
      </Component>
    )
  }
}

Form.propTypes = {
  fields: PropTypes.array.isRequired,
  required: PropTypes.array,
  allRequired: PropTypes.bool,
  component: PropTypes.string,
  children: PropTypes.node.isRequired,
  callbackOnChange: PropTypes.func,
  isMultiFormInput: PropTypes.bool,
}

Form.defaultProps = {
  component: 'form',
}

export default withStyles(theme => ({
  form: {
    margin: 0,
  },
}), { injectTheme: true })(Form)
