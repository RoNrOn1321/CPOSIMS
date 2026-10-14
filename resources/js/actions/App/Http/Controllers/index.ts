import PosController from './PosController'
import PosCheckoutController from './PosCheckoutController'
import BalanceTopupController from './BalanceTopupController'
import ParentDashboardController from './ParentDashboardController'
import ParentStudentLimitController from './ParentStudentLimitController'
import ParentStudentStatusController from './ParentStudentStatusController'
import Admin from './Admin'
import ProfileController from './ProfileController'
import Auth from './Auth'
const Controllers = {
    PosController: Object.assign(PosController, PosController),
PosCheckoutController: Object.assign(PosCheckoutController, PosCheckoutController),
BalanceTopupController: Object.assign(BalanceTopupController, BalanceTopupController),
ParentDashboardController: Object.assign(ParentDashboardController, ParentDashboardController),
ParentStudentLimitController: Object.assign(ParentStudentLimitController, ParentStudentLimitController),
ParentStudentStatusController: Object.assign(ParentStudentStatusController, ParentStudentStatusController),
Admin: Object.assign(Admin, Admin),
ProfileController: Object.assign(ProfileController, ProfileController),
Auth: Object.assign(Auth, Auth),
}

export default Controllers