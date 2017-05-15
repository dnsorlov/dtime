import React, {Component} from 'react';
import PT from 'prop-types';
import classNames from 'classnames';


class DTMonthsGrid extends Component {
  static propTypes = {
    date:       PT.object,
    _onChange:  PT.func
  }

  onMonthClick = i => {
    this.props._onChange(i)
  }

  render(){
    const block = 'month-year-grid';
    const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const selectedMonth = this.props.date ? this.props.date.getMonth() : '';

    return (
      <div className={block}>
        {months.map((v,i) =>
          <div
            className={classNames(
              block+'__el',
              i === selectedMonth && 'is-active',
              i === currentMonth && 'is-current'
            )}
            onClick={()=>this.onMonthClick(i)}
            key={block+i}
          >{v}</div>)
        }
      </div>
    )
  }
}

export default DTMonthsGrid
