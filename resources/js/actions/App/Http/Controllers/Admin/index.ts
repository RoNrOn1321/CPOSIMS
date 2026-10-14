import ProductController from './ProductController'
import AuditLogController from './AuditLogController'
import ReportController from './ReportController'
import StudentAccountController from './StudentAccountController'
const Admin = {
    ProductController: Object.assign(ProductController, ProductController),
AuditLogController: Object.assign(AuditLogController, AuditLogController),
ReportController: Object.assign(ReportController, ReportController),
StudentAccountController: Object.assign(StudentAccountController, StudentAccountController),
}

export default Admin