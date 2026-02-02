import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/store/settings-store';
import { Truck, MapPin, Clock, DollarSign, Plus, Trash2 } from 'lucide-react';

interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  deliveryCharges: number;
  estimatedTime: string;
  isActive: boolean;
}

export default function DeliveryChargesManager() {
  const { settings, updateSettings } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([
    {
      id: '1',
      name: 'Within 5km',
      description: 'Local delivery within 5 kilometers',
      deliveryCharges: 50,
      estimatedTime: '30-45 mins',
      isActive: true,
    },
    {
      id: '2',
      name: '5-10km',
      description: 'Extended delivery area',
      deliveryCharges: 100,
      estimatedTime: '45-60 mins',
      isActive: true,
    },
    {
      id: '3',
      name: '10-15km',
      description: 'Outer delivery zone',
      deliveryCharges: 150,
      estimatedTime: '60-90 mins',
      isActive: true,
    },
  ]);
  const [newZone, setNewZone] = useState({
    name: '',
    description: '',
    deliveryCharges: '',
    estimatedTime: '',
  });

  const handleAddZone = () => {
    if (newZone.name && newZone.deliveryCharges) {
      const zone: DeliveryZone = {
        id: Date.now().toString(),
        name: newZone.name,
        description: newZone.description,
        deliveryCharges: parseFloat(newZone.deliveryCharges),
        estimatedTime: newZone.estimatedTime,
        isActive: true,
      };
      setDeliveryZones([...deliveryZones, zone]);
      setNewZone({ name: '', description: '', deliveryCharges: '', estimatedTime: '' });
    }
  };

  const handleDeleteZone = (id: string) => {
    setDeliveryZones(deliveryZones.filter(zone => zone.id !== id));
  };

  const handleToggleZone = (id: string) => {
    setDeliveryZones(deliveryZones.map(zone =>
      zone.id === id ? { ...zone, isActive: !zone.isActive } : zone
    ));
  };

  const handleSaveSettings = () => {
    // Update global delivery charges based on the first active zone
    const firstActiveZone = deliveryZones.find(zone => zone.isActive);
    if (firstActiveZone) {
      updateSettings({ deliveryCharges: firstActiveZone.deliveryCharges });
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Delivery Charges Management</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Configure delivery zones and charges</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Current Settings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Current Delivery Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-slate-900 dark:text-white">Default Charges</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{settings.deliveryCharges}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Base delivery fee</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="font-medium text-slate-900 dark:text-white">Active Zones</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {deliveryZones.filter(zone => zone.isActive).length}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Delivery zones</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-slate-900 dark:text-white">Avg. Time</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">45 mins</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Delivery time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Zones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Delivery Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryZones.map((zone) => (
              <div key={zone.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${zone.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{zone.name}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{zone.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">₹{zone.deliveryCharges}</p>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{zone.estimatedTime}</p>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleZone(zone.id)}
                        className={`${zone.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'} text-xs sm:text-sm`}
                      >
                        <span className="hidden sm:inline">{zone.isActive ? 'Disable' : 'Enable'}</span>
                        <span className="sm:hidden">{zone.isActive ? 'Off' : 'On'}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteZone(zone.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Zone */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              Add New Delivery Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zoneName">Zone Name</Label>
                <Input
                  id="zoneName"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="e.g., Within 3km"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="zoneCharges">Delivery Charges (₹)</Label>
                <Input
                  id="zoneCharges"
                  type="number"
                  value={newZone.deliveryCharges}
                  onChange={(e) => setNewZone({ ...newZone, deliveryCharges: e.target.value })}
                  placeholder="50"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="zoneDescription">Description</Label>
                <Input
                  id="zoneDescription"
                  value={newZone.description}
                  onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                  placeholder="Zone description"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="zoneTime">Estimated Time</Label>
                <Input
                  id="zoneTime"
                  value={newZone.estimatedTime}
                  onChange={(e) => setNewZone({ ...newZone, estimatedTime: e.target.value })}
                  placeholder="30-45 mins"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={handleAddZone} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Policy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-500" />
            Delivery Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">Free Delivery Conditions</h4>
              <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Orders above ₹500 get free delivery within 5km</li>
                <li>• Corporate orders above ₹2000 get free delivery in all zones</li>
                <li>• Wedding catering orders are always free delivery</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 text-sm sm:text-base">Delivery Time Guidelines</h4>
              <ul className="text-xs sm:text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Peak hours (12-2 PM, 7-9 PM): +15 minutes</li>
                <li>• Weather conditions may affect delivery time</li>
                <li>• Large orders may require additional preparation time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

