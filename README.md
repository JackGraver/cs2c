# CS Demo Viewer

Passion project to create a a web-based viewer for 2D visualization of CS2 demos.

## Inspiration

This project was inspired by my favorite demo viewer [cslens.com](https://cslens.com). Please go check out their website, its far better than mine :)

## Backend Parsing

The backend utilizes the [`awpy`](https://github.com/pnxenopoulos/awpy) Python library, developed by Peter Xenopoulos, for parsing and analyzing CS2 demo files. `awpy` is licensed under the [MIT License](https://github.com/pnxenopoulos/awpy/blob/main/LICENSE). I extend our gratitude to the `awpy` contributors for their invaluable work.

## Tech Stack

- **Frontend**: React with TypeScript. PixiJS for Map Visualization
- **Backend**: Python (FastAPI) + awpy
- **Data Format**: Custom JSON tick data served per round

## License

MIT License
