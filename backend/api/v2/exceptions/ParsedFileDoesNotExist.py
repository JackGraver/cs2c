class InvalidDemoFileError(Exception):
    """Raised when there is no files for the requested parsed Demo."""
    def __init__(self, demo_id:str, message="No File for Demo"):
        self.message = f"{message}: {demo_id}"
        super().__init__(self.message)