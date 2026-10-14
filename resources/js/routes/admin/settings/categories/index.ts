import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SettingController::store
 * @see app/Http/Controllers/Admin/SettingController.php:134
 * @route '/admin/settings/categories'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/settings/categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::store
 * @see app/Http/Controllers/Admin/SettingController.php:134
 * @route '/admin/settings/categories'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::store
 * @see app/Http/Controllers/Admin/SettingController.php:134
 * @route '/admin/settings/categories'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::update
 * @see app/Http/Controllers/Admin/SettingController.php:150
 * @route '/admin/settings/categories/{category}'
 */
export const update = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/settings/categories/{category}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::update
 * @see app/Http/Controllers/Admin/SettingController.php:150
 * @route '/admin/settings/categories/{category}'
 */
update.url = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { category: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        category: typeof args.category === 'object'
                ? args.category.id
                : args.category,
                }

    return update.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::update
 * @see app/Http/Controllers/Admin/SettingController.php:150
 * @route '/admin/settings/categories/{category}'
 */
update.put = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SettingController::destroy
 * @see app/Http/Controllers/Admin/SettingController.php:166
 * @route '/admin/settings/categories/{category}'
 */
export const destroy = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/settings/categories/{category}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::destroy
 * @see app/Http/Controllers/Admin/SettingController.php:166
 * @route '/admin/settings/categories/{category}'
 */
destroy.url = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { category: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    category: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        category: typeof args.category === 'object'
                ? args.category.id
                : args.category,
                }

    return destroy.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::destroy
 * @see app/Http/Controllers/Admin/SettingController.php:166
 * @route '/admin/settings/categories/{category}'
 */
destroy.delete = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const categories = {
    store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default categories