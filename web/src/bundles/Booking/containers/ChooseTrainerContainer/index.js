import React, {Component} from 'react'
import {connect} from 'react-redux'
import ChooseTrainer from '@Booking/components/ChooseTrainer'
import * as Actions from '@shared/actions';
import { selectTrainer, fetchTrainers, searchTrainerAvailabilities, addSubscriptionOption } from '@store/modules/booking/actions';
import ApiUtils from '@utils/ApiUtils';
import CONSTS from '@utils/Consts'
import { selectPlan } from '@store/modules/subscription/actions';
import moment from 'moment';

type Props = {
  activities: Array,
  bookingState: Object,
  selectTrainer: Function,
  getTrainers: Function,
  selectPlan: Function,
  addSubscriptionOption: Function,
  locationPermission: boolean,
  getLocationPermission: Function,
  requestingLocationPermission: boolean,
  searchTrainerAvailabilities: Function

}

class ChooseTrainerContainer extends Component {
  props: Props
  constructor(props) {
    super(props);
    this.onChooseTrainer = this.onChooseTrainer.bind(this)
  }
  fetchTrainers() {
    // var searchObj = {
    //   lat: 33.8101512,
    //   lon: -84.4225184,
    //   radius: 10
    // };
    var bookingState = this.props.bookingState;
    if(this.props.bookingState.bookingType == CONSTS.BOOKING_TYPE.BY_ACTIVITY) {
      this.props.searchTrainerAvailabilities(33.8101512, -84.4225184, 20,
        bookingState.chosenActivity.id,
        moment(bookingState.chosenDate).utc().format());
    } else if(this.props.bookingState.bookingType == CONSTS.BOOKING_TYPE.BY_TRAINER) {
      this.props.searchTrainerAvailabilities(33.8101512, -84.4225184, 20,
        undefined,
        moment().utc().add(90, 'minutes').format());
    }

  }

  componentDidMount() {
    this.fetchTrainers();
  }

  onChooseTrainer(trainer) {
    this.props.selectTrainer(trainer);
    if(this.props.bookingState.bookingType == CONSTS.BOOKING_TYPE.BY_ACTIVITY) {
      if(this.props.user.workoutInfo && this.props.user.workoutInfo.isActive &&
        this.props.user.workoutInfo.numWorkoutsLeft > 0) {
          this.props.selectPlan(this.props.user.workoutInfo.plan);
          this.props.addSubscriptionOption(this.props.user.workoutInfo.plan);
          Actions.reviewWorkout();
        } else {
          Actions.choosePlan();
        }

    } else if(this.props.bookingState.bookingType == CONSTS.BOOKING_TYPE.BY_TRAINER) {
      Actions.chooseActivity();
    }

  }

  render() {
    return (<ChooseTrainer
              onChooseTrainer = {this.onChooseTrainer}
              {...this.props}/>)
  }

}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    activities: state.auth.appSettings.activities,
    bookingState: state.booking,
    requestingLocationPermission: state.auth.requestingLocationPermission,
    locationPermission: state.auth.locationPermission,
    trainers: state.booking.trainers
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectTrainer: (trainer) => {
      dispatch(selectTrainer(trainer))
    },
    getLocationPermission: () => {
      dispatch(getLocationPermission());
    },
    getTrainers: (lat, lon, radius) => {
      dispatch(fetchTrainers(lat, lon, radius));
    },
    selectPlan: (plan) => {
        dispatch(selectPlan(plan));
    },
    searchTrainerAvailabilities: (lat, lon, radius, activityId, dateTime) => {
      dispatch(searchTrainerAvailabilities(lat, lon, radius, activityId, dateTime));
    },
    addSubscriptionOption: (plan) => {
      dispatch(addSubscriptionOption(plan))
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ChooseTrainerContainer)
