import React, {Component} from 'react';
import PT from 'prop-types';
import classNames from 'classnames';
import DTMonthsGrid from './DTMonthGrid.jsx';
import DTYearsGrid from './DTYearGrid.jsx'


export default class DTCalendar extends Component {
  static propTypes = {
    value: PT.oneOfType([
                    PT.string,
                    PT.number ]),
    id:             PT.string,
    className:      PT.string,
    label:          PT.string,
    labelPosition:  PT.string,
    required:       PT.bool,
    disabled:       PT.bool,
    onChange:       PT.func
  };


  componentWillMount() {
    this.setState({
      date: this.props.value ? new Date(this.props.value) : new Date(),
      currentDate: new Date(),
      selectedCell: null,
      valueDate: new Date(this.props.value),
      warning: false,
      showTop: false,
      showGrid: false
    })
  }

  componentWillReceiveProps(props) {
    let newDate = new Date(props.value);
    this.setState({date: newDate});
  }

  doChange() {
    this.setState({date: new Date(this.state.date.setSeconds(0))});
    this.setState({date: new Date(this.state.date.setMilliseconds(0))});
    try {
      if (this.props.onChange && !this.props.disabled)
        this.props.onChange(this.state.date);
    } catch (e) {
      this.setState({warning: true});
      console.warn(e.message)
    }
  }

  getCountDay(index) {
    let months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        year = this.state.date.getFullYear();

    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))
      months[1]++;

    return months[index] - 1;
  }

  getCountWeek(date) {
    let d = new Date(date);
    d.setDate(1);
    return Math.ceil((this.getCountDay(d.getMonth()) + this.getNumberDay(d)) / 7);
  }

  getNumberDay(date) {
    let days = [6, 0, 1, 2, 3, 4, 5];
    return days[date.getDay()];
  }

  getNumberFirstDay(date) {
    let d = new Date(date);
    d.setDate(1);
    return this.getNumberDay(d);
  }

  setMonth = n => {
    this.setState({date: new Date(this.state.date.setMonth(n))});
  };

  setYear = n => {
    this.setState({date: new Date(this.state.date.setFullYear(n))});
  };


  setValue(e) {
    this.state.date.setDate(Number(e.target.textContent));
    let newDate = new Date(this.state.date);
    this.setState({
      date: newDate,
      valueDate: newDate,
      selectedCell: e.target.textContent
    });
    this.doChange();
  }

  toggleGrid(type){
    this.setState({gridType:this.state.gridType === type ? '' : type})
  }


  render() {
    let {date, currentDate} = this.state,
        block     = 'dtcalendar',
        valueDate = new Date(this.props.value),
        countDays = this.getCountDay(date.getMonth()),
        firstDay  = this.getNumberFirstDay(date),
        i         = 0,
        c         = 0,
        clName    = [],
        days      = [];

    for (let w = 0; w <= this.getCountWeek(date); w++) {
      for (let d = 0; d <= 7; d++) {
        i++;

        if (c <= countDays && i >= firstDay) {
          c++;
          clName[i] = '';
          days[i] = <div onClick={e => this.setValue(e)} key={'div' + c}>{c}</div>;

          if (currentDate.getFullYear() === date.getFullYear()
          &&  currentDate.getMonth() === date.getMonth()
          &&  currentDate.getDate() === c)
            clName[i] = 'currDay';

          if (date.getFullYear() === valueDate.getFullYear()
          &&  date.getMonth() === valueDate.getMonth()
          &&  valueDate.getDate() === c)
            clName[i] = 'selected'
        }
      }
    }


    const yearMonth = (
      <div className={block+'__header'}>
        <span className={block+'__header-el'} onClick={()=> this.toggleGrid('month')}>{date.toLocaleString('en', { month: "long" })}</span>
        <span className={block+'__header-separator'}>/</span>
        <span className={block+'__header-el'} onClick={()=> this.toggleGrid('year')} >{date.getFullYear()}</span>
      </div>
    );


    const table = (
      <table className={block+'__table'} key='caltbl'>
        <tbody>
        <tr>
          <th>mo</th>
          <th>tu</th>
          <th>we</th>
          <th>th</th>
          <th>fr</th>
          <th>sa</th>
          <th>su</th>
        </tr>
        <tr>
          <td className={clName[0]}>{ days[0] }</td>
          <td className={clName[1]}>{ days[1] }</td>
          <td className={clName[2]}>{ days[2] }</td>
          <td className={clName[3]}>{ days[3] }</td>
          <td className={clName[4]}>{ days[4] }</td>
          <td className={'weekEnd' + ' ' + clName[5]}> { days[5] }</td>
          <td className={'weekEnd' + ' ' + clName[6]}> { days[6] }</td>
        </tr>
        <tr>
          <td className={clName[7]}>{ days[7] }</td>
          <td className={clName[8]}>{ days[8] }</td>
          <td className={clName[9]}>{ days[9] }</td>
          <td className={clName[10]}>{ days[10] }</td>
          <td className={clName[11]}>{ days[11] }</td>
          <td className={'weekEnd' + ' ' + clName[12]}>{ days[12] }</td>
          <td className={'weekEnd' + ' ' + clName[13]}>{ days[13] }</td>
        </tr>
        <tr>
          <td className={clName[14]}>{ days[14] }</td>
          <td className={clName[15]}>{ days[15] }</td>
          <td className={clName[16]}>{ days[16] }</td>
          <td className={clName[17]}>{ days[17] }</td>
          <td className={clName[18]}>{ days[18] }</td>
          <td className={'weekEnd' + ' ' + clName[19]}>{ days[19] }</td>
          <td className={'weekEnd' + ' ' + clName[20]}>{ days[20] }</td>
        </tr>
        <tr>
          <td className={clName[21]}>{ days[21] }</td>
          <td className={clName[22]}>{ days[22] }</td>
          <td className={clName[23]}>{ days[23] }</td>
          <td className={clName[24]}>{ days[24] }</td>
          <td className={clName[25]}>{ days[25] }</td>
          <td className={'weekEnd' + ' ' + clName[26]}>{ days[26] }</td>
          <td className={'weekEnd' + ' ' + clName[27]}>{ days[27] }</td>
        </tr>
        <tr>
          <td className={clName[28]}>{ days[28] }</td>
          <td className={clName[29]}>{ days[29] }</td>
          <td className={clName[30]}>{ days[30] }</td>
          <td className={clName[31]}>{ days[31] }</td>
          <td className={clName[32]}>{ days[32] }</td>
          <td className={'weekEnd' + ' ' + clName[33]}>{ days[33] }</td>
          <td className={'weekEnd' + ' ' + clName[34]}>{ days[34] }</td>
        </tr>
        <tr>
          <td className={clName[35]}>{ days[35] }</td>
          <td className={clName[36]}>{ days[36] }</td>
          <td className={clName[37]}>{ days[37] }</td>
          <td className={clName[38]}>{ days[38] }</td>
          <td className={clName[39]}>{ days[39] }</td>
          <td className={'weekEnd' + ' ' + clName[40]}>{ days[40] }</td>
          <td className={'weekEnd' + ' ' + clName[41]}>{ days[41] }</td>
        </tr>
        </tbody>
      </table>
    );

    return (
      <div
        className={classNames(block,
          (this.state.focused || this.state.warning) && 'focused',
          this.props.disabled && 'dtimeCalendar',
          this.state.warning && 'warning',
          this.props.className,
          this.state.showTop ? 'show-top' : 'show-bottom')}
        ref='calendar'
        id={this.props.id}>
        {yearMonth}
        {table}
        {this.state.gridType === 'month' && <DTMonthsGrid _onChange={this.setMonth} date={this.state.date}/>}
        {this.state.gridType === 'year' && <DTYearsGrid _onChange={this.setYear} date={this.state.date}/>}
      </div>
    )
  }
}
