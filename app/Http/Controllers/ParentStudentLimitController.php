<?php

namespace App\Http\Controllers;

use App\Models\StudentAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParentStudentLimitController extends Controller
{
    /**
     * Update the daily spending limit for the specified student account.
     */
    public function update(Request $request, StudentAccount $student): RedirectResponse
    {
        // Enforce parent ownership authorization
        abort_if((int) $student->parent_id !== (int) Auth::id(), 403, 'Unauthorized access to student account.');

        $validated = $request->validate([
            'daily_limit' => ['required', 'numeric', 'min:0', 'max:10000'],
        ]);

        $student->update([
            'daily_spending_limit' => $validated['daily_limit'],
            'is_spending_limited' => true,
        ]);

        return redirect()->back()->with('success', 'Daily spending limit updated successfully.');
    }
}
