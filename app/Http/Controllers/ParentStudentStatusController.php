<?php

namespace App\Http\Controllers;

use App\Models\StudentAccount;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParentStudentStatusController extends Controller
{
    /**
     * Update the card status (active / lost_card) for the specified student account.
     */
    public function update(Request $request, StudentAccount $student): JsonResponse|RedirectResponse
    {
        $user = Auth::user();
        $isAdmin = $user && ($user->role === 'admin' || (method_exists($user, 'hasRole') && $user->hasRole('admin')));

        if (! $isAdmin && (int) $student->parent_id !== (int) Auth::id()) {
            abort(403, 'Unauthorized access to student account.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,lost_card'],
        ]);

        $student->update([
            'status' => $validated['status'],
        ]);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'message' => 'Student RFID card status updated successfully.',
                'status' => $student->status,
            ], 200);
        }

        return redirect()->back()->with('success', 'Student RFID card status updated successfully.');
    }
}
