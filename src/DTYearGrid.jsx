import React, {Component} from 'react';
import PT from 'prop-types';
import classNames from 'classnames';

class DTYearsGrid extends Component {
  static propTypes = {
    date:PT.object
  }

  componentWillMount(){
    const cy = new Date().getFullYear();
    const years = [cy-5, cy-4, cy-3, cy-2, cy-1, cy, cy+1, cy+2, cy+3, cy+4];
    this.setState({years:years})
  }

  prevDecade =()=> {
    const years = this.state.years.map(v => v-10);
    this.setState({years:years})
  }
  nextDecade =()=> {
    const years = this.state.years.map(v => v+10);
    this.setState({years:years})
  }

  onYearClick = v => {
    this.props._onChange(v)
  }

  render(){
    const block = 'month-year-grid';
    return (
      <div className={block}>
        <div className={`${block}__el ${block}__el--arrow-left`} onClick={this.prevDecade}>left</div>
        {this.state.years.map((v,i) =>
          <div
            className={classNames(block+'__el', v === this.props.date.getFullYear() && 'is-active')}
            onClick={()=> this.onYearClick(v)}
            key={block+i}>{v}</div>
        )}
        <div className={`${block}__el ${block}__el--arrow-right`} onClick={this.nextDecade}>right</div>
      </div>
    )
  }
}

export default DTYearsGrid
