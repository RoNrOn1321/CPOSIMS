import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

export default function ParentDashboardIndex() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Parent Dashboard</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Purchase History</TabsTrigger>
            <TabsTrigger value="limits">Daily Limits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Current Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-stct-blue">$45.00</div>
                  <p className="text-xs text-gray-500 mt-2">Available for your child</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Today's Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-stct-maroon">$5.50</div>
                  <p className="text-xs text-gray-500 mt-2">Out of $10.00 daily limit</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Your child's recent transactions at the school cafeteria.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-semibold">Chicken Sandwich</div>
                      <div className="text-sm text-gray-500">Oct 8, 2026 12:30 PM</div>
                    </div>
                    <div className="font-bold">-$4.00</div>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-semibold">Orange Juice</div>
                      <div className="text-sm text-gray-500">Oct 8, 2026 12:30 PM</div>
                    </div>
                    <div className="font-bold">-$1.50</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="limits">
            <Card>
              <CardHeader>
                <CardTitle>Manage Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Configure daily spending limits here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
