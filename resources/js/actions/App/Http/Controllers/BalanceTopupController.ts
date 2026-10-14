import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BalanceTopupController::posStore
 * @see app/Http/Controllers/BalanceTopupController.php:95
 * @route '/pos/topup'
 */
export const posStore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: posStore.url(options),
    method: 'post',
})

posStore.definition = {
    methods: ["post"],
    url: '/pos/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BalanceTopupController::posStore
 * @see app/Http/Controllers/BalanceTopupController.php:95
 * @route '/pos/topup'
 */
posStore.url = (options?: RouteQueryOptions) => {
    return posStore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BalanceTopupController::posStore
 * @see app/Http/Controllers/BalanceTopupController.php:95
 * @route '/pos/topup'
 */
posStore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: posStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BalanceTopupController::parentStore
 * @see app/Http/Controllers/BalanceTopupController.php:19
 * @route '/parent/student-accounts/{student}/topup'
 */
export const parentStore = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: parentStore.url(args, options),
    method: 'post',
})

parentStore.definition = {
    methods: ["post"],
    url: '/parent/student-accounts/{student}/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BalanceTopupController::parentStore
 * @see app/Http/Controllers/BalanceTopupController.php:19
 * @route '/parent/student-accounts/{student}/topup'
 */
parentStore.url = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return parentStore.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BalanceTopupController::parentStore
 * @see app/Http/Controllers/BalanceTopupController.php:19
 * @route '/parent/student-accounts/{student}/topup'
 */
parentStore.post = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: parentStore.url(args, options),
    method: 'post',
})
const BalanceTopupController = { posStore, parentStore }

export default BalanceTopupController