import ProductController from './ProductController'
import AuditLogController from './AuditLogController'
const Admin = {
    ProductController: Object.assign(ProductController, ProductController),
AuditLogController: Object.assign(AuditLogController, AuditLogController),
}

export default Admin