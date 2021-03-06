import React, { PropTypes } from 'react';
import DateConstants from './DateConstants';
import { getTitleString, getTodayTime } from '../util/';

function isSameDay(one, two) {
  return one && two && one.isSame(two, 'day');
}

function isSelectedDay(one, two) {
  return one && two && one.isSame(two, 'day');
}

function isWorkoutDay(date, workoutItems) {
  for(var i=0;i<workoutItems.length;i++) {
    var d1 = new Date(date);
    var d2 = new Date(workoutItems[i].date);
    if((d1.getFullYear() == d2.getFullYear())&&(d1.getMonth() == d2.getMonth())&&(d1.getDate() == d2.getDate())) {
      return true;
    }
    if((i+1)==workoutItems.length)
      return false;
  }
}

function beforeCurrentMonthYear(current, today) {
  if (current.year() < today.year()) {
    return 1;
  }
  return current.year() === today.year() &&
    current.month() < today.month();
}

function afterCurrentMonthYear(current, today) {
  if (current.year() > today.year()) {
    return 1;
  }
  return current.year() === today.year() &&
    current.month() > today.month();
}

function getIdFromDate(date) {
  return `rc-calendar-${date.year()}-${date.month()}-${date.date()}`;
}

const DateTBody = React.createClass({
  propTypes: {
    contentRender: PropTypes.func,
    dateRender: PropTypes.func,
    disabledDate: PropTypes.func,
    prefixCls: PropTypes.string,
    selectedValue: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
    value: PropTypes.object,
    hoverValue: PropTypes.any,
    showWeekNumber: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      hoverValue: [],
    };
  },

  render() {
    const props = this.props;
    const {
      contentRender, prefixCls, selectedValue, value,
      showWeekNumber, dateRender, disabledDate,
      hoverValue, workoutItems, selectedWorkoutValue
    } = props;
    let iIndex;
    let jIndex;
    let current;
    const dateTable = [];
    const today = getTodayTime(value);
    const cellClass = `${prefixCls}-cell`;
    const weekNumberCellClass = `${prefixCls}-week-number-cell`;
    let dateClass = `${prefixCls}-date`;
    const todayClass = `${prefixCls}-today`;
    const selectedClass = `${prefixCls}-selected-day`;
    const selectedDateClass = `${prefixCls}-selected-date`;  // do not move with mouse operation
    const inRangeClass = `${prefixCls}-in-range-cell`;
    const lastMonthDayClass = `${prefixCls}-last-month-cell`;
    const nextMonthDayClass = `${prefixCls}-next-month-btn-day`;
    const disabledClass = `${prefixCls}-disabled-cell`;
    const firstDisableClass = `${prefixCls}-disabled-cell-first-of-row`;
    const lastDisableClass = `${prefixCls}-disabled-cell-last-of-row`;
    const month1 = value.clone();
    month1.date(1);
    const day = month1.day();
    const lastMonthDiffDay = (day + 7 - value.localeData().firstDayOfWeek()) % 7;
    // calculate last month
    const lastMonth1 = month1.clone();
    lastMonth1.add(0 - lastMonthDiffDay, 'days');
    let passed = 0;
    for (iIndex = 0; iIndex < DateConstants.DATE_ROW_COUNT; iIndex++) {
      for (jIndex = 0; jIndex < DateConstants.DATE_COL_COUNT; jIndex++) {
        current = lastMonth1;
        if (passed) {
          current = current.clone();
          current.add(passed, 'days');
        }
        dateTable.push(current);
        passed++;
      }
    }
    const tableHtml = [];
    passed = 0;

    for (iIndex = 0; iIndex < DateConstants.DATE_ROW_COUNT; iIndex++) {
      let isCurrentWeek;
      let weekNumberCell;
      const dateCells = [];
      if (showWeekNumber) {
        weekNumberCell = (
          <td
            key={dateTable[passed].week()}
            role="gridcell"
            className={weekNumberCellClass}
          >
            {dateTable[passed].week()}
          </td>
        );
      }
      for (jIndex = 0; jIndex < DateConstants.DATE_COL_COUNT; jIndex++) {
        let next = null;
        let last = null;
        let dateDisabled = false;
        current = dateTable[passed];
        if (jIndex < DateConstants.DATE_COL_COUNT - 1) {
          next = dateTable[passed + 1];
        }
        if (jIndex > 0) {
          last = dateTable[passed - 1];
        }
        let cls = cellClass;
        let disabled = false;
        let selected = false;

        const isBeforeCurrentMonthYear = beforeCurrentMonthYear(current, value);
        const isAfterCurrentMonthYear = afterCurrentMonthYear(current, value);
        if (isSameDay(current, today)) {
          if(!isBeforeCurrentMonthYear && !isAfterCurrentMonthYear)
          cls += ` ${todayClass}`;
          isCurrentWeek = true;
        }
        if (selectedValue && Array.isArray(selectedValue)) {
          const rangeValue = hoverValue.length ? hoverValue : selectedValue;
          if (!isBeforeCurrentMonthYear && !isAfterCurrentMonthYear) {
            const startValue = rangeValue[0];
            const endValue = rangeValue[1];
            if (startValue) {
              if (isSameDay(current, startValue)) {
                selected = true;
              }
            }
            if (startValue && endValue) {
              if (isSameDay(current, endValue)) {
                selected = true;
              } else if (current.isAfter(startValue, 'day') &&
                current.isBefore(endValue, 'day')) {
                //cls += ` ${inRangeClass}`;
              }
            }
          }
        } else if (isSameDay(current, value)) {
          // keyboard change value, highlight works
          selected = true;
        }

        if (isSameDay(current, selectedValue)) {
          //cls += ` ${selectedDateClass}`;
          dateClass += ` ${selectedDateClass}`;
        }

        if (isBeforeCurrentMonthYear) {
          dateDisabled = true;
          cls += ` ${lastMonthDayClass}`;
        }
        
        if (isAfterCurrentMonthYear) {
          dateDisabled = true;
          cls += ` ${nextMonthDayClass}`;
        }

        if (disabledDate) {
          if (disabledDate(current, value)) {
            disabled = true;

            if (!last || !disabledDate(last, value)) {
              cls += ` ${firstDisableClass}`;
            }

            if (!next || !disabledDate(next, value)) {
              cls += ` ${lastDisableClass}`;
            }
          }
        }

        if (selected) {
          cls += ` ${selectedClass}`;
        }

        if (disabled) {
          cls += ` ${disabledClass}`;
        }

        let dateHtml;
        if (dateRender) {
          dateHtml = dateRender(current, value);
        } else {
          const content = contentRender ? contentRender(current, value) : current.date();
          dateHtml = (
            <div
              key={getIdFromDate(current)}
              className={(isSameDay(current, selectedWorkoutValue) && !dateDisabled)?dateClass+` workout-selected-date`:(isWorkoutDay(current._d, workoutItems) && !dateDisabled)?dateClass+` workout-date`:dateClass}
              aria-selected={selected}
              aria-disabled={disabled}
            >
              {content}
            </div>);
        }

        dateCells.push(
          <td
            key={passed}
            onClick={disabled ? undefined : props.onSelect.bind(null, current)}
            role="gridcell"
            title={getTitleString(current)} className={cls}
          >
            {dateHtml}
          </td>);

        passed++;
      }
      tableHtml.push(
        <tr
          key={iIndex}
          role="row"
          className={iIndex != 5 ? ('bottom-border' || isCurrentWeek && `${prefixCls}-current-week`) : (isCurrentWeek && `${prefixCls}-current-week`) }
        >
          {weekNumberCell}
          {dateCells}
        </tr>);
    }
    return (<tbody className={`${prefixCls}-tbody`}>
    {tableHtml}
    </tbody>);
  },
});

export default DateTBody;
