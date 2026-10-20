import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\StudentAccountController::index
 * @see app/Http/Controllers/Admin/StudentAccountController.php:20
 * @route '/admin/students'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/students',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::index
 * @see app/Http/Controllers/Admin/StudentAccountController.php:20
 * @route '/admin/students'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::index
 * @see app/Http/Controllers/Admin/StudentAccountController.php:20
 * @route '/admin/students'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StudentAccountController::index
 * @see app/Http/Controllers/Admin/StudentAccountController.php:20
 * @route '/admin/students'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::searchParents
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
export const searchParents = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: searchParents.url(options),
    method: 'get',
})

searchParents.definition = {
    methods: ["get","head"],
    url: '/admin/parents/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::searchParents
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
searchParents.url = (options?: RouteQueryOptions) => {
    return searchParents.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::searchParents
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
searchParents.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: searchParents.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StudentAccountController::searchParents
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
searchParents.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: searchParents.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::store
 * @see app/Http/Controllers/Admin/StudentAccountController.php:70
 * @route '/admin/students'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/students',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::store
 * @see app/Http/Controllers/Admin/StudentAccountController.php:70
 * @route '/admin/students'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::store
 * @see app/Http/Controllers/Admin/StudentAccountController.php:70
 * @route '/admin/students'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::update
 * @see app/Http/Controllers/Admin/StudentAccountController.php:98
 * @route '/admin/students/{student}'
 */
export const update = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/students/{student}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::update
 * @see app/Http/Controllers/Admin/StudentAccountController.php:98
 * @route '/admin/students/{student}'
 */
update.url = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{student}', parsedArgs.student.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::update
 * @see app/Http/Controllers/Admin/StudentAccountController.php:98
 * @route '/admin/students/{student}'
 */
update.put = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
const StudentAccountController = { index, searchParents, store, update }

export default StudentAccountController