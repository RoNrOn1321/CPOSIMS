import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/pos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosController::lookupStudent
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
export const lookupStudent = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lookupStudent.url(options),
    method: 'get',
})

lookupStudent.definition = {
    methods: ["get","head"],
    url: '/pos/student-lookup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::lookupStudent
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
lookupStudent.url = (options?: RouteQueryOptions) => {
    return lookupStudent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::lookupStudent
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
lookupStudent.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lookupStudent.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::lookupStudent
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
lookupStudent.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lookupStudent.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosController::hardwareStatus
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
export const hardwareStatus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: hardwareStatus.url(options),
    method: 'get',
})

hardwareStatus.definition = {
    methods: ["get","head"],
    url: '/pos/hardware-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::hardwareStatus
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
hardwareStatus.url = (options?: RouteQueryOptions) => {
    return hardwareStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::hardwareStatus
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
hardwareStatus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: hardwareStatus.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::hardwareStatus
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
hardwareStatus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: hardwareStatus.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosController::printReceipt
 * @see app/Http/Controllers/PosController.php:212
 * @route '/pos/hardware-print'
 */
export const printReceipt = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: printReceipt.url(options),
    method: 'post',
})

printReceipt.definition = {
    methods: ["post"],
    url: '/pos/hardware-print',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosController::printReceipt
 * @see app/Http/Controllers/PosController.php:212
 * @route '/pos/hardware-print'
 */
printReceipt.url = (options?: RouteQueryOptions) => {
    return printReceipt.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::printReceipt
 * @see app/Http/Controllers/PosController.php:212
 * @route '/pos/hardware-print'
 */
printReceipt.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: printReceipt.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PosController::voidTransaction
 * @see app/Http/Controllers/PosController.php:492
 * @route '/pos/transactions/{transaction}/void'
 */
export const voidTransaction = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: voidTransaction.url(args, options),
    method: 'post',
})

voidTransaction.definition = {
    methods: ["post"],
    url: '/pos/transactions/{transaction}/void',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosController::voidTransaction
 * @see app/Http/Controllers/PosController.php:492
 * @route '/pos/transactions/{transaction}/void'
 */
voidTransaction.url = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { transaction: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    transaction: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        transaction: typeof args.transaction === 'object'
                ? args.transaction.id
                : args.transaction,
                }

    return voidTransaction.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::voidTransaction
 * @see app/Http/Controllers/PosController.php:492
 * @route '/pos/transactions/{transaction}/void'
 */
voidTransaction.post = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: voidTransaction.url(args, options),
    method: 'post',
})
const PosController = { index, lookupStudent, hardwareStatus, printReceipt, voidTransaction }

export default PosController