import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SettingController::store
 * @see app/Http/Controllers/Admin/SettingController.php:69
 * @route '/admin/settings/users'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/settings/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::store
 * @see app/Http/Controllers/Admin/SettingController.php:69
 * @route '/admin/settings/users'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::store
 * @see app/Http/Controllers/Admin/SettingController.php:69
 * @route '/admin/settings/users'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::update
 * @see app/Http/Controllers/Admin/SettingController.php:96
 * @route '/admin/settings/users/{user}'
 */
export const update = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/settings/users/{user}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::update
 * @see app/Http/Controllers/Admin/SettingController.php:96
 * @route '/admin/settings/users/{user}'
 */
update.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return update.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::update
 * @see app/Http/Controllers/Admin/SettingController.php:96
 * @route '/admin/settings/users/{user}'
 */
update.put = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
const users = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
}

export default users