import products from './products'
import auditLogs from './audit-logs'
import reports from './reports'
import students from './students'
import settings from './settings'
const admin = {
    products: Object.assign(products, products),
auditLogs: Object.assign(auditLogs, auditLogs),
reports: Object.assign(reports, reports),
students: Object.assign(students, students),
settings: Object.assign(settings, settings),
}

export default admin