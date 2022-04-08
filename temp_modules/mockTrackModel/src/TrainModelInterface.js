export default class TrainModelInterface {
constructor(id) {
    this.trainId = id
    this.intf = {
        inputs: {
            id: id,
            boardingPax: 0,
            speedCmd: 0,
            authorityCmd: 0,
            station: '',
            rightPlatform: false,
            leftPlatform: false,
            underground: false,
            grade: 0
            },
        outputs: {
            distance: 0,
            passengers: 0,
            maxBoardingPax: 222,
            deboardingPax: 0
            }
        }
    }
}