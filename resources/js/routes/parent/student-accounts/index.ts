import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ParentStudentStatusController::status
 * @see app/Http/Controllers/ParentStudentStatusController.php:16
 * @route '/parent/student-accounts/{student}/status'
 */
export const status = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: status.url(args, options),
    method: 'patch',
})

status.definition = {
    methods: ["patch"],
    url: '/parent/student-accounts/{student}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ParentStudentStatusController::status
 * @see app/Http/Controllers/ParentStudentStatusController.php:16
 * @route '/parent/student-accounts/{student}/status'
 */
status.url = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { student: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { student: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    student: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        student: typeof args.student === 'object'
                ? args.student.id
                : args.student,
                }

    return status.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ParentStudentStatusController::status
 * @see app/Http/Controllers/ParentStudentStatusController.php:16
 * @route '/parent/student-accounts/{student}/status'
 */
status.patch = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: status.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\BalanceTopupController::topup
 * @see app/Http/Controllers/BalanceTopupController.php:19
 * @route '/parent/student-accounts/{student}/topup'
 */
export const topup = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(args, options),
    method: 'post',
})

topup.definition = {
    methods: ["post"],
    url: '/parent/student-accounts/{student}/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BalanceTopupController::topup
 * @see app/Http/Controllers/BalanceTopupController.php:19
 * @route '/parent/student-accounts/{student}/topup'
 */
topup.url = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { student: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { student: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    student: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        student: typeof args.student === 'object'
                ? args.student.id
                : args.student,
                }

    return topup.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BalanceTopupController::topup
 * @see app/Http/Controllers/BalanceTopupController.php:19
 * @route '/parent/student-accounts/{student}/topup'
 */
topup.post = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(args, options),
    method: 'post',
})
const studentAccounts = {
    status: Object.assign(status, status),
topup: Object.assign(topup, topup),
}

export default studentAccounts