import React, {Component} from 'react';
import PT from 'prop-types'
import DTCalendar from './DTCalendar.jsx';
let clnm = require('classnames');


class Digits extends Component {
  static propTypes = {
    name:           PT.string.isRequired,
    length:         PT.number.isRequired,  // digits quantity
    value:          PT.number,
    overrideValue:  PT.number,             // override value
    emptyMask:      PT.string,             // show if value is empty
    exClassName:    PT.string,             // additional classname
    selected:       PT.bool,
    disabled:       PT.bool,
    onClick:        PT.func                // (name: string)
  };

  onClick() {
    if (!this.props.disabled && this.props.onClick)
      this.props.onClick(this.props.name);
  }

  formatValue() {
    let value;

    this.props.selected && this.props.overrideValue
      ? value = this.props.overrideValue
      : value = this.props.value;

    if (typeof value !== 'number') return this.props.emptyMask;

    let res = String(value);

    while (res.length < this.props.length) {
      res = '0' + res;
    }

    return res;
  }

  render() {
    const {disabled, selected, exClassName} = this.props;
    let classes =
      clnm(
        'dtime__digit',
        disabled && '_state_disabled',
        selected && '_state_selected',
        exClassName
      );

    return <span className={classes} onClick={e => this.onClick()}>{this.formatValue()}</span>;
  }
}


export class CustomDateTimeEditor extends Component {

  static propTypes = {
    value:              PT.number,
    onChange:           PT.func.isRequired,
    caption:            PT.string,
    description:        PT.string,
    errorText:          PT.string,
    disabled:           PT.bool,
    hasClearButton:     PT.bool,
    hasCalendarButton:  PT.bool,
    hasArrows:          PT.bool,
    hasError:           PT.bool,
    required:           PT.bool,
    inline:             PT.bool,
    inputTimeout:       PT.bool,
    hasSeconds:         PT.bool,
    useSeconds:         PT.bool
  };

  static defaultProps = {
    hasArrows: false,
    hasCalendarButton: true
  };

  keyboardIntervalMS = 1200;
  fieldsOrder = ['DD', 'MM', 'YYYY', 'HH', 'mm', 'SS'];
  lastReceivedValue;          // user input container
  handleFastEditTimeout = 0;  // keyboard fast input timeout

  fieldsDef = {
    DD: {min: 1, max: 31, defValue: null},
    MM: {min: 1, max: 12, defValue: null},
    YYYY: {min: 1900, max: 2099, defValue: new Date().getFullYear()},
    HH: {min: 0, max: 23, defValue: null},
    mm: {min: 0, max: 59, defValue: null},
    SS: {min: 0, max: 59, defValue: null}
  };

  KeyCodes = {
    RIGHT: 39,
    LEFT: 37,
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    ESC: 27,
    DEL: 46,
    SPACE: 32,
    KEY_0: 48,
    KEY_9: 57,
    BSP: 8
  };


  componentWillMount(){
    this.lastReceivedValue = this.props.value;

    const dState = this.calcDateState(this.props.value);
    dState.popup = false;
    this.setState({dState})
  }

  calcDateState(value) {
    const d = (typeof value !== 'undefined') ? new Date(value) : null;

    return {
      DD: d ? d.getDate() : undefined,
      MM: d ? d.getMonth() + 1 : undefined,
      YYYY: d ? d.getFullYear() : undefined,
      HH: d ? d.getHours() : undefined,
      mm: d ? d.getMinutes() : undefined,
      SS: d ? d.getSeconds() : undefined
    }
  }

  componentWillReceiveProps(props) {
    if ((props.value !== this.props.value)) {
      this.lastReceivedValue = props.value;

      if (!this.state.selectedElementName)
        this.setState(this.calcDateState(props.value));

    }
  }

  onDigitClick(name) {
    if (this.props.disabled) return;

    if (this.state.selectedElementName !== name) {
      this.setState({
        selectedElementName: name,
        keyboardValue: null
      });
    }
  }

  onBlur() {
    this.setState({
      selectedElementName: '',
      focused: false,
      keyboardValue: null
    });

    if (this.props.disabled) return;
    this.doChange();
  }

  onFocus() {
    this.setState({
      selectedElementName: '',
      focused: true,
      keyboardValue: null
    });
  }

  onKeyDown(e) {
    if (this.props.disabled || e.altKey || e.shiftKey || e.ctrlKey) return;

    if (e.keyCode === this.KeyCodes.LEFT || e.keyCode === this.KeyCodes.BSP) {
      this.selectPrevItem();
      e.preventDefault();

      return;
    }

    if (e.keyCode === this.KeyCodes.RIGHT || e.keyCode === this.KeyCodes.SPACE) {
      this.selectNextItem();
      e.preventDefault();

      return;
    }

    if (e.keyCode === this.KeyCodes.DOWN) {
      this.decrementCurrentValue();
      e.preventDefault();

      return;
    }

    if (e.keyCode === this.KeyCodes.UP) {
      this.incrementCurrentValue();
      e.preventDefault();

      return;
    }

    if (e.keyCode === this.KeyCodes.ESC) {
      this.cancel();
      e.preventDefault();

      return;
    }

    if (e.keyCode === this.KeyCodes.ENTER) {
      if (this.state.keyboardValue) e.preventDefault();

      this.keyboardInputCommit(false, () => {
        this.doChange();
      });
    }

    if ((e.keyCode >= this.KeyCodes.KEY_0) && (e.keyCode <= this.KeyCodes.KEY_9)) {

      if (!this.state.selectedElementName) return;

      let digit = e.keyCode - this.KeyCodes.KEY_0;
      clearTimeout(this.handleFastEditTimeout);

      let userInput = (this.state.keyboardValue) ? this.state.keyboardValue + String(digit) : String(digit);
      let field = this.fieldsDef[this.state.selectedElementName];

      if (this.hasContinue(userInput, field.max)) {
        this.setState({
          keyboardValue: userInput
        }, () => {
          this.handleFastEditTimeout = setTimeout(
            () => this.keyboardInputCommit(true), this.keyboardIntervalMS
          )
        });

      } else {

        this.setState({
          keyboardValue: userInput
        }, () => {
          this.keyboardInputCommit(true)
        });
      }
      e.preventDefault();
    }
  }

  hasContinue(numStr, max) {
    let num = parseInt(numStr);

    return !(numStr.length >= String(max).length || num >= max || num * 10 > max)
  }

  keyboardInputCommit(goNext, onComplete) {
    clearTimeout(this.handleFastEditTimeout);
    let field = this.fieldsDef[this.state.selectedElementName];
    let strValue = this.state.keyboardValue;

    this.setState({keyboardValue: null});

    if (!field) {
      onComplete && onComplete();
      return;
    }

    let numValue = parseInt(strValue);

    if ((field.min <= numValue) && (field.max >= numValue)) {
      let newState = {};
      newState[this.state.selectedElementName] = numValue;

      this.setState(newState, () => {
        this.doChangeIfCorrect();
        goNext && this.selectNextItem();
        onComplete && onComplete();
      });
    } else {
      onComplete && onComplete();
    }
  }

  selectPrevItem() {
    this.keyboardInputCommit(false, () => {
      let curEl = this.state.selectedElementName;
      let index = this.fieldsOrder.indexOf(curEl);

      if (index < 0)
        index = this.fieldsOrder.length;


      index = index + this.fieldsOrder.length - 1;
      index = index % this.fieldsOrder.length;

      this.setState({selectedElementName: this.fieldsOrder[index]});
    });
  }

  selectNextItem() {
    this.keyboardInputCommit(false, () => {
      let curEl = this.state.selectedElementName;
      let index = this.fieldsOrder.indexOf(curEl);
      index = index + 1;

      this.setState({selectedElementName: this.fieldsOrder[index]});
    });
  }

  decrementCurrentValue() {
    let elName = this.state.selectedElementName;
    let field = this.fieldsDef[elName];

    if (!field) return;

    let value = this.state[elName];

    if (typeof value === 'number') {
      value--;

      if (value < field.min) {
        value = field.max;
      }
    } else {
      value = (typeof field.defValue === 'number') ? field.defValue : field.max;
    }

    let newState = {};
    newState[elName] = value;

    this.setState(newState, () => this.doChangeIfCorrect());
  }

  incrementCurrentValue() {
    let elName = this.state.selectedElementName;
    let field = this.fieldsDef[elName];

    if (!field) return;

    let value = this.state[elName];

    if (typeof value === 'number') {
      value++;

      if (value > field.max) {
        value = field.min;
      }

    } else {
      value = (typeof field.defValue === 'number') ? field.defValue : field.min;
    }

    let newState = {};
    newState[elName] = value;
    this.setState(newState, () => this.doChangeIfCorrect());
  }

  calcDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  // validate and correct date, call onChange
  doChange() {
    let value   = null,
        s       = this.state,
        year    = s.YYYY,
        month   = s.MM,
        day     = s.DD,
        hours   = (typeof s.HH === 'number') ? s.HH : 0,
        minutes = (typeof s.mm === 'number') ? s.mm : 0,
        seconds = (typeof s.SS === 'number') ? s.SS : 0;

    if (year && month && day) {

      if (this.calcDaysInMonth(month, year) < day)
        day = this.calcDaysInMonth(month, year);


      let date = new Date(year, month - 1, day, hours, minutes, seconds, 0);
      value = date.getTime();

    } else {
      value = undefined
    }

    this.setState(
      this.calcDateState(value), () => {
        this.props.onChange && this.props.onChange(value);
      }
    );
  }

  doChangeIfCorrect() {
    let value   = null,
        s       = this.state,
        year    = s.YYYY,
        month   = s.MM,
        day     = s.DD,
        hours   = (typeof s.HH === 'number') ? s.HH : 0,
        minutes = (typeof s.mm === 'number') ? s.mm : 0,
        seconds = (typeof s.SS === 'number') ? s.SS : 0;

    if (year && month && day) {

      let date = new Date(year, month - 1, day, hours, minutes, seconds, 0);
      value = date.getTime();

      if ((date.getDate() === day) && (date.getMonth() === month - 1) && (date.getFullYear() === year)) {

        this.setState(
          this.calcDateState(value), () => {
            this.props.onChange && this.props.onChange(value);
          }
        );
      }
    }
  }

  cancel() {
    let newState = this.calcDateState(this.lastReceivedValue);
    newState.selectedElementName = '';

    this.setState(newState);
  }

  clear() {
    let newState = this.calcDateState(undefined);
    newState.selectedElementName = '';

    this.setState(newState, () => this.doChange());
  }

  setPopup() {
    if (!this.state.popup) {
      document.addEventListener('click', this.onDocumentClick);
      this.setState({popup: true});
    } else {
      document.removeEventListener('click', this.onDocumentClick);
      this.setState({popup: false});
    }
  }

  onDocumentClick = event => {
    let e = event.target || event.srcElement;

    if (e.id === 'popup') return;

    while (e = e.parentNode) {
      if (e.id === 'popup') return;
    }

    this.setPopup();
  };

  render() {
    let currentInputValue = this.state.keyboardValue ? parseInt(this.state.keyboardValue) : null;
    let classes = clnm(
      'dtime__input',
      this.props.disabled && '_state_disabled',
      this.props.hasError && '_state_error',
      this.props.hasArrows && '_has-arrows',
      this.state.popup && '_state_popup'
    );

    return (
      <div className='dtime__field'>
        {this.state.popup &&
          <DTCalendar
            id='popup'
            value={this.props.value}
            onChange={v => this.setState(this.calcDateState(v), () =>
                  this.props.onChange && this.props.onChange(v)
            )}
            size='small'/>

        }
        <time
          className={classes}
          onFocus={e => this.onFocus(e)}
          onKeyDown={e => this.onKeyDown(e)}
          tabIndex={this.props.disabled ? null : 0}
          onBlur={e => this.onBlur(e)}>

          <Digits
            name='DD'
            emptyMask='dd'
            length={2}
            value={this.state.DD}
            overrideValue={currentInputValue}
            selected={(this.state.selectedElementName === 'DD') && !this.props.disabled}
            onClick={name => this.onDigitClick(name)}/>

          <i className='dtime__sep'>-</i>

          <Digits
            name='MM'
            emptyMask='mm'
            length={2}
            value={this.state.MM}
            overrideValue={currentInputValue}
            selected={(this.state.selectedElementName === 'MM') && !this.props.disabled}
            onClick={name => this.onDigitClick(name)}/>

          <i className='dtime__sep'>-</i>

          <Digits
            name='YYYY'
            emptyMask='yyyy'
            length={4}
            value={this.state.YYYY}
            overrideValue={currentInputValue}
            selected={(this.state.selectedElementName === 'YYYY') && !this.props.disabled}
            exClassName='_size_middle'
            onClick={name => this.onDigitClick(name)}/>

          <i className='dtime__sep _gap'> </i>

          <Digits
            name='HH'
            emptyMask='hh'
            length={2}
            value={this.state.HH}
            overrideValue={currentInputValue}
            selected={(this.state.selectedElementName === 'HH') && !this.props.disabled}
            onClick={name => this.onDigitClick(name)}/>

          <i className='dtime__sep'>:</i>

          <Digits
            name='mm'
            emptyMask='mm'
            length={2}
            value={this.state.mm}
            overrideValue={currentInputValue}
            selected={(this.state.selectedElementName === 'mm') && !this.props.disabled}
            onClick={name => this.onDigitClick(name)}/>

          {this.props.useSeconds &&
            <span>
              <i className='dtime__sep'>:</i>
              <Digits
                name='SS'
                emptyMask='ss'
                length={2}
                value={this.state.SS}
                overrideValue={currentInputValue}
                selected={(this.state.selectedElementName === 'SS') && !this.props.disabled}
                onClick={name => this.onDigitClick(name)}/>
            </span>
          }

          <i className='dtime__sep _gap'> </i>

          {this.props.hasArrows &&
          <i className='dtime__arrows'>
            <a
              className={clnm('dtime__arrow', 'icon-angle-up', !this.state.selectedElementName && '_state_disabled')}
              onClick={() => this.state.selectedElementName && this.incrementCurrentValue()}>
            </a>

            <a
              className={clnm('dtime__arrow', 'icon-angle-down', !this.state.selectedElementName && '_state_disabled')}
              onClick={() => this.state.selectedElementName && this.decrementCurrentValue()}>
            </a>
          </i>
          }
        </time>

        <div className='dtime__actions'>
          {this.props.hasCalendarButton &&
            <a
              className={clnm('dtime__action', 'icon-calendar', this.state.popup && '_state_active')}
              onClick={ e => this.setPopup() }>
            </a>
          }
          {this.props.hasClearButton && !this.props.disabled &&
            <a
              className='dtime__action icon-cross'
              onClick={ e => !this.props.disabled && this.clear() }>
            </a>
          }
        </div>
      </div>
    )
  }
}

export default class App extends Component {
  state = {date: undefined};

  onChange(v) {
    this.setState({date: v ? new Date(v).getTime() : undefined})
  }

  render() {
    return (
      <CustomDateTimeEditor
        value={this.state.date}
        disabled={false}
        hasClearButton={true}
        hasCalendarButton={true}
        hasArrows={false}
        size='small'
        onChange={v => this.onChange(v)}
      />
    );
  }
}
