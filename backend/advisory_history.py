import json
import os
from datetime import datetime
from typing import List, Dict, Any
import aiofiles
import asyncio
# from pathlib import Path

class AdvisoryHistory:
    def _init_(self, history_file: str = "advisory_history.json"):
        self.history_file = history_file
        self.history: List[Dict[str, Any]] = []
        self.lock = asyncio.Lock()
        self._load_history_sync()
    
    def _load_history_sync(self):
        """Load history synchronously on initialization"""
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    data = json.load(f)
                    self.history = data.get('history', [])
            except Exception as e:
                print(f"Error loading history: {e}")
                self.history = []
        else:
            self.history = []
    
    async def add_advisory(self, advisory_data: Dict[str, Any]) -> None:
        """Add a new advisory to history"""
        async with self.lock:
            entry = {
                **advisory_data,
                'id': f"{datetime.now().timestamp()}_{len(self.history)}",
                'timestamp': datetime.now().isoformat()
            }
            
            # Add to beginning of list (most recent first)
            self.history.insert(0, entry)
            
            # Keep only last 500 entries
            if len(self.history) > 500:
                self.history = self.history[:500]
            
            # Save to file
            await self._save_history()
    
    async def _save_history(self) -> None:
        """Save history to file"""
        try:
            async with aiofiles.open(self.history_file, 'w') as f:
                await f.write(json.dumps({
                    'history': self.history,
                    'last_updated': datetime.now().isoformat()
                }, indent=2))
        except Exception as e:
            print(f"Error saving history: {e}")
    
    async def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get advisory history"""
        async with self.lock:
            return self.history[:limit]
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get statistics from history"""
        async with self.lock:
            if not self.history:
                return {
                    'total_advisories': 0,
                    'alert_distribution': {},
                    'average_temperatures': {},
                    'last_advisory': None
                }
            
            total = len(self.history)
            alert_counts = {}
            temp_sums = {'battery': 0, 'ambient': 0}
            temp_counts = {'battery': 0, 'ambient': 0}
            
            for entry in self.history:
                # Count alert levels
                alert_level = entry.get('alert_level', 'unknown')
                alert_counts[alert_level] = alert_counts.get(alert_level, 0) + 1
                
                # Sum temperatures
                if 'battery_temp' in entry:
                    temp_sums['battery'] += entry['battery_temp']
                    temp_counts['battery'] += 1
                if 'ambient_temp' in entry:
                    temp_sums['ambient'] += entry['ambient_temp']
                    temp_counts['ambient'] += 1
            
            return {
                'total_advisories': total,
                'alert_distribution': alert_counts,
                'average_temperatures': {
                    'battery': temp_sums['battery'] / temp_counts['battery'] if temp_counts['battery'] > 0 else 0,
                    'ambient': temp_sums['ambient'] / temp_counts['ambient'] if temp_counts['ambient'] > 0 else 0
                },
                'last_advisory': self.history[0] if self.history else None
            }