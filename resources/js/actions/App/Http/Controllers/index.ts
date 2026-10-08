import ProfileController from './ProfileController'
import Auth from './Auth'
const Controllers = {
    ProfileController: Object.assign(ProfileController, ProfileController),
Auth: Object.assign(Auth, Auth),
}

export default Controllers