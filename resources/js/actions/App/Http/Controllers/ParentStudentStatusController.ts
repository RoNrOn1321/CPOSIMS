import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ParentStudentStatusController::update
 * @see app/Http/Controllers/ParentStudentStatusController.php:16
 * @route '/parent/student-accounts/{student}/status'
 */
export const update = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/parent/student-accounts/{student}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ParentStudentStatusController::update
 * @see app/Http/Controllers/ParentStudentStatusController.php:16
 * @route '/parent/student-accounts/{student}/status'
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
* @see \App\Http\Controllers\ParentStudentStatusController::update
 * @see app/Http/Controllers/ParentStudentStatusController.php:16
 * @route '/parent/student-accounts/{student}/status'
 */
update.patch = (args: { student: number | { id: number } } | [student: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})
const ParentStudentStatusController = { update }

export default ParentStudentStatusController