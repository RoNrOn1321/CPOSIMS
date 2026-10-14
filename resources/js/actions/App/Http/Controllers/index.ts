import PosCheckoutController from './PosCheckoutController'
import ParentDashboardController from './ParentDashboardController'
import ParentStudentLimitController from './ParentStudentLimitController'
import Admin from './Admin'
import ProfileController from './ProfileController'
import Auth from './Auth'
const Controllers = {
    PosCheckoutController: Object.assign(PosCheckoutController, PosCheckoutController),
ParentDashboardController: Object.assign(ParentDashboardController, ParentDashboardController),
ParentStudentLimitController: Object.assign(ParentStudentLimitController, ParentStudentLimitController),
Admin: Object.assign(Admin, Admin),
ProfileController: Object.assign(ProfileController, ProfileController),
Auth: Object.assign(Auth, Auth),
}

export default Controllers