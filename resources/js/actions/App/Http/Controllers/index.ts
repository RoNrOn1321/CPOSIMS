import PosCheckoutController from './PosCheckoutController'
import ProfileController from './ProfileController'
import Auth from './Auth'
const Controllers = {
    PosCheckoutController: Object.assign(PosCheckoutController, PosCheckoutController),
ProfileController: Object.assign(ProfileController, ProfileController),
Auth: Object.assign(Auth, Auth),
}

export default Controllers