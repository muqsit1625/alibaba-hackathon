import logging


class Color:
    """A class for terminal color codes."""

    BOLD = "\033[1m"
    BLUE = "\033[94m"
    WHITE = "\033[97m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD_WHITE = BOLD + WHITE
    BOLD_BLUE = BOLD + BLUE
    BOLD_GREEN = BOLD + GREEN
    BOLD_YELLOW = BOLD + YELLOW
    BOLD_RED = BOLD + RED
    END = "\033[0m"


class ColorLogFormatter(logging.Formatter):
    """A class for formatting colored logs."""

    FORMAT = "%(prefix)s[%(asctime)s] %(levelname)s: %(msg)s%(suffix)s  %(filename)s:%(lineno)d"

    LOG_LEVEL_COLOR = {
        "DEBUG": {'prefix': Color.BOLD_BLUE, 'suffix': Color.END},
        "INFO": {'prefix': Color.BOLD_GREEN, 'suffix': Color.END},
        "WARNING": {'prefix': Color.BOLD_YELLOW, 'suffix': Color.END},
        "ERROR": {'prefix': Color.BOLD_RED, 'suffix': Color.END},
        "CRITICAL": {'prefix': Color.BOLD_RED, 'suffix': Color.END},
    }

    def format(self, record):
        """Format log records with a default prefix and suffix to terminal color codes that corresponds to the log level name."""
        if not hasattr(record, 'prefix'):
            record.prefix = self.LOG_LEVEL_COLOR.get(record.levelname.upper()).get('prefix')
        
        if not hasattr(record, 'suffix'):
            record.suffix = self.LOG_LEVEL_COLOR.get(record.levelname.upper()).get('suffix')

        formatter = logging.Formatter(self.FORMAT)
        return formatter.format(record)



class Logger(object):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            print('Creating the object')
            cls._instance = logging.getLogger('AUTH')
            cls._instance.setLevel('DEBUG')

            stream_handler = logging.StreamHandler()
            stream_handler.setFormatter(ColorLogFormatter())
            cls._instance.addHandler(stream_handler)
            # Put any initialization here.
        return cls._instance



logger = Logger()