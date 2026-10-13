<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PosCheckoutRequest extends FormRequest
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
            'payment_method' => ['required', 'string', 'in:cash,cashless'],
            'rfid_uid' => ['required_if:payment_method,cashless', 'nullable', 'string'],
            'amount_tendered' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
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
            'rfid_uid.required_if' => 'The RFID UID is required for cashless payment transactions.',
            'items.required' => 'The cart must contain at least one item.',
            'items.min' => 'The cart must contain at least one item.',
            'items.*.product_id.exists' => 'One or more selected products do not exist in the inventory.',
            'items.*.quantity.min' => 'Item quantity must be at least 1.',
        ];
    }
}
