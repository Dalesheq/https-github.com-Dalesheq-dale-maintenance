import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Search,
  Check,
  ChevronDown,
  Building2,
  Wrench,
  Globe2,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  SITE_CATALOG,
  getAllFlattenedEquipment,
  FlattenedSiteEquipment,
  ClientFacility,
} from '../data/siteCatalog';

export interface SiteSelectionData {
  facilityName: string;
  locationAddress: string;
  clientGroup: string;
  assetNumber: string;
  assetName: string;
  category: string;
  country: string;
  region: string;
  gps?: { latitude: number; longitude: number };
}

interface SiteEquipmentDropdownProps {
  selectedAssetNumber?: string;
  selectedFacilityName?: string;
  onSelect: (data: SiteSelectionData) => void;
  className?: string;
  variant?: 'compact' | 'full' | 'inline-selector';
  label?: string;
}

export const SiteEquipmentDropdown: React.FC<SiteEquipmentDropdownProps> = ({
  selectedAssetNumber = '',
  selectedFacilityName = '',
  onSelect,
  className = '',
  variant = 'full',
  label = 'Plant Site & Machinery Asset',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const allEquipment = useMemo(() => getAllFlattenedEquipment(), []);

  // Filtered equipment list
  const filteredEquipment = useMemo(() => {
    let list = allEquipment;
    if (selectedCountryFilter !== 'All') {
      list = list.filter((item) => item.country === selectedCountryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.facilityName.toLowerCase().includes(q) ||
          item.assetNumber.toLowerCase().includes(q) ||
          item.assetName.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.clientGroup.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEquipment, selectedCountryFilter, searchQuery]);

  // Current matched item
  const currentItem = useMemo(() => {
    if (!selectedAssetNumber && !selectedFacilityName) return null;
    return allEquipment.find(
      (item) =>
        (selectedAssetNumber && item.assetNumber.toLowerCase() === selectedAssetNumber.toLowerCase()) ||
        (selectedFacilityName && item.facilityName.toLowerCase().includes(selectedFacilityName.toLowerCase()))
    );
  }, [allEquipment, selectedAssetNumber, selectedFacilityName]);

  const handleChoose = (item: FlattenedSiteEquipment) => {
    onSelect({
      facilityName: item.facilityName,
      locationAddress: item.locationAddress,
      clientGroup: item.clientGroup,
      assetNumber: item.assetNumber,
      assetName: item.assetName,
      category: item.category,
      country: item.country,
      region: item.region,
      gps: item.gps,
    });
    setIsOpen(false);
    setSearchQuery('');
  };

  const countries = [
    { code: 'All', label: 'All Regions', flag: '🌍', count: allEquipment.length },
    { code: 'South Africa', label: 'South Africa', flag: '🇿🇦', count: allEquipment.filter((e) => e.country === 'South Africa').length },
    { code: 'Australia', label: 'Australia', flag: '🇦🇺', count: allEquipment.filter((e) => e.country === 'Australia').length },
    { code: 'Zambia', label: 'Zambia', flag: '🇿🇲', count: allEquipment.filter((e) => e.country === 'Zambia').length },
    { code: 'Zimbabwe', label: 'Zimbabwe', flag: '🇿🇼', count: allEquipment.filter((e) => e.country === 'Zimbabwe').length },
    { code: 'Namibia', label: 'Namibia', flag: '🇳🇦', count: allEquipment.filter((e) => e.country === 'Namibia').length },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
          <span className="text-[11px] font-medium text-slate-400">
            Official Dale Automation Machinery Catalog
          </span>
        </div>
      )}

      {/* Trigger Button / Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer rounded-lg border transition-all ${
          isOpen
            ? 'border-red-500 ring-2 ring-red-500/20 bg-white'
            : 'border-slate-300 bg-white hover:border-slate-400'
        } p-2.5 shadow-2xs flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            {currentItem ? (
              <span className="text-base">{currentItem.countryFlag}</span>
            ) : (
              <Building2 className="h-4 w-4 text-slate-500" />
            )}
          </div>

          <div className="min-w-0 truncate">
            {currentItem ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {currentItem.facilityName}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="font-mono text-xs font-bold text-red-700 shrink-0">
                    {currentItem.assetNumber}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentItem.assetName} &bull; {currentItem.region}
                </div>
              </div>
            ) : selectedFacilityName || selectedAssetNumber ? (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedFacilityName || 'Selected Facility'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {selectedAssetNumber || 'Custom Asset'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Click to select plant facility &amp; machinery asset...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {allEquipment.length} Sites &amp; Assets
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180 text-red-600' : ''}`}
          />
        </div>
      </div>

      {/* Popover Dropdown Drawer */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[460px] w-full rounded-xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Header & Search */}
          <div className="border-b border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by asset code (e.g. DSS 311-2, KAAK001), plant (Sasko Aeroton), or region..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-red-600 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Country Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {countries.map((c) => {
                const isSelected = selectedCountryFilter === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCountryFilter(c.code)}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.label}</span>
                    <span
                      className={`ml-0.5 rounded px-1 py-0.2 text-[10px] ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[320px] p-1">
            {filteredEquipment.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Building2 className="mx-auto h-6 w-6 text-slate-300 mb-1" />
                <p>No machinery assets match &quot;{searchQuery}&quot;</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Try searching by serial number like &apos;DSS 395&apos;, &apos;KAAK&apos;, or plant city.
                </p>
              </div>
            ) : (
              filteredEquipment.map((item) => {
                const isSelected =
                  selectedAssetNumber &&
                  item.assetNumber.toLowerCase() === selectedAssetNumber.toLowerCase();

                return (
                  <div
                    key={item.uniqueKey}
                    onClick={() => handleChoose(item)}
                    className={`cursor-pointer rounded-lg p-2.5 transition-colors flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-red-50/80 border border-red-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-lg leading-none mt-0.5 shrink-0">
                        {item.countryFlag}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.facilityName}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                            {item.region}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                            {item.assetNumber}
                          </span>
                          <span className="text-xs font-medium text-slate-700 truncate">
                            {item.assetName}
                          </span>
                        </div>

                        <div className="mt-0.5 text-[11px] text-slate-400 truncate">
                          {item.category} &bull; {item.clientGroup}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 opacity-0 group-hover:opacity-100">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Stats Bar in footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Showing {filteredEquipment.length} of {allEquipment.length} machinery assets
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-semibold text-slate-700 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
