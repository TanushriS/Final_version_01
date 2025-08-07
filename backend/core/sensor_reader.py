# sensor_reader.py
import clr
from pathlib import Path

dll_path = (Path(__file__).parent / ".."/ ".." / "LibreHardwareMonitor-net472" / "LibreHardwareMonitorLib.dll").resolve()
clr.AddReference(str(dll_path))

from LibreHardwareMonitor.Hardware import Computer, SensorType

computer = Computer()
computer.IsCpuEnabled = True
computer.Open()

def get_core_average_temperature():
    for hardware in computer.Hardware:
        hardware.Update()
        for sensor in hardware.Sensors:
            if (
                sensor.SensorType == SensorType.Temperature
                and sensor.Name.strip().lower() == "core average"
            ):
                return round(sensor.Value, 2)
    return None
