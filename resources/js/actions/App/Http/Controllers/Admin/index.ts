import ProductController from './ProductController'
import AuditLogController from './AuditLogController'
import ReportController from './ReportController'
import StudentAccountController from './StudentAccountController'
import SettingController from './SettingController'
const Admin = {
    ProductController: Object.assign(ProductController, ProductController),
AuditLogController: Object.assign(AuditLogController, AuditLogController),
ReportController: Object.assign(ReportController, ReportController),
StudentAccountController: Object.assign(StudentAccountController, StudentAccountController),
SettingController: Object.assign(SettingController, SettingController),
}

export default Admin