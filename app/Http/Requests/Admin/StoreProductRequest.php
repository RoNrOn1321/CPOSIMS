<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'barcode' => ['required', 'string', 'max:64', 'unique:products,barcode'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['required', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
            'image_file' => ['nullable', 'file', 'image', 'mimes:jpeg,jpg,png,webp,gif,svg', 'max:5120'],
            'image_url' => ['nullable', 'string', 'url', 'max:1024'],
            'image_source' => ['nullable', 'string', 'in:upload,url,none'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Please select a valid product category.',
            'category_id.exists' => 'The selected product category does not exist.',
            'barcode.unique' => 'This barcode is already assigned to another product.',
            'price.min' => 'Selling price cannot be negative.',
            'cost.min' => 'Capital cost cannot be negative.',
            'stock_quantity.min' => 'Stock quantity cannot be negative.',
            'reorder_level.min' => 'Reorder level cannot be negative.',
            'image_file.image' => 'The uploaded file must be a valid image.',
            'image_file.mimes' => 'The image must be a file of type: jpeg, jpg, png, webp, gif, svg.',
            'image_file.max' => 'The image size may not exceed 5MB.',
            'image_url.url' => 'Please enter a valid image web URL (e.g. https://example.com/item.jpg).',
        ];
    }
}
