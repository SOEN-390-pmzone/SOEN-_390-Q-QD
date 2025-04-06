import matplotlib.pyplot as plt
import numpy as np

# --- Data Extracted from Your Test Cases (Original + New) ---
test_cases = [
    # --- Original Tests ---
    {
        "name": "Simple Linear Path",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},
            {"id": "B", "latitude": 1, "longitude": 0},
            {"id": "C", "latitude": 2, "longitude": 0},
            {"id": "D", "latitude": 3, "longitude": 0},
        ],
        "path_ids": ["A", "B", "C", "D"] # Expected path order
    },
    {
        "name": "Clustered Points",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},
            {"id": "B", "latitude": 1, "longitude": 1},
            {"id": "C", "latitude": 2, "longitude": 2},
            {"id": "D", "latitude": 10, "longitude": 10}, # Far away point
        ],
         "path_ids": ["A", "B", "C", "D"] # Expected path order
    },
    {
        "name": "Circular Path",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},
            {"id": "B", "latitude": 0, "longitude": 1},
            {"id": "C", "latitude": 1, "longitude": 1},
            {"id": "D", "latitude": 1, "longitude": 0},
        ],
        "path_ids": ["A", "B", "C", "D"] # Expected path order
    },
    {
        "name": "Sparse and Dense Regions",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},
            {"id": "B", "latitude": 1, "longitude": 1},
            {"id": "C", "latitude": 2, "longitude": 2}, # Dense
            {"id": "D", "latitude": 50, "longitude": 50}, # Sparse
            {"id": "E", "latitude": 51, "longitude": 51}, # Sparse
        ],
         "path_ids": ["A", "B", "C", "D", "E"] # Expected path order
    },
    {
        "name": "Tricky Path (Misleading Distances)",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},
            {"id": "B", "latitude": 10, "longitude": 0},
            {"id": "C", "latitude": 5, "longitude": 5},
            {"id": "D", "latitude": 10, "longitude": 10},
        ],
         "path_ids": ["A", "C", "B", "D"] # Specific order based on NN trace
    },
    # --- New Tests ---
    {
        "name": "Forced Detour",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},  # Start
            {"id": "B", "latitude": 1, "longitude": 1},  # Very close to A
            {"id": "C", "latitude": 10, "longitude": 10},# Far cluster
            {"id": "D", "latitude": 11, "longitude": 10},
            {"id": "E", "latitude": 10, "longitude": 11},
        ],
        # Path Trace: A -> B -> C -> D -> E (Assuming D chosen over E in C->D/C->E tie)
        "path_ids": ["A", "B", "C", "D", "E"]
    },
    {
        "name": "Collinear Points (Jumbled Order)",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 5}, # Start (X=5)
            {"id": "B", "latitude": 0, "longitude": 0}, # X=0
            {"id": "C", "latitude": 0, "longitude": 10},# X=10
            {"id": "D", "latitude": 0, "longitude": 2}, # X=2
        ],
        # Path Trace: A(5) -> D(2) -> B(0) -> C(10)
        "path_ids": ["A", "D", "B", "C"] # Expected path
    },
    {
        "name": "Asymmetric Equidistant Choices",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 0},   # Start
            {"id": "B", "latitude": 1, "longitude": 1},   # Slightly closer
            {"id": "C", "latitude": 1, "longitude": -1.01}, # Slightly further
            {"id": "D", "latitude": 3, "longitude": 0},
        ],
        # Path Trace: A -> B -> C -> D
        "path_ids": ["A", "B", "C", "D"]
    },
    {
        "name": "Potential Path Crossing",
        "locations": [
            {"id": "A", "latitude": 0, "longitude": 5}, # Top Left
            {"id": "B", "latitude": 1, "longitude": 0}, # Bottom Left
            {"id": "C", "latitude": 5, "longitude": 5}, # Top Right
            {"id": "D", "latitude": 6, "longitude": 0}, # Bottom Right
        ],
        # Path Trace: A -> C -> D -> B
        "path_ids": ["A", "C", "D", "B"]
    },
]


# --- Plotting Configuration ---
num_tests = len(test_cases)
# Use 3 columns for a 3x3 grid for 9 tests
ncols = 3
nrows = (num_tests + ncols - 1) // ncols # Calculates ceil(num_tests / ncols)
fig, axes = plt.subplots(nrows, ncols, figsize=(ncols * 6, nrows * 5.5)) # Create figure and subplots

# --- Pre-computation and Flattening Axes ---
# Flatten axes array for easy iteration, handle single row/col/item cases
if num_tests == 0:
    print("No test cases to plot.")
    exit()
elif num_tests == 1:
    axes = np.array([axes]) # Ensure axes is always iterable even for 1 plot
else:
    # Check if axes is already flat (e.g., if nrows=1 or ncols=1)
    if isinstance(axes, np.ndarray):
        axes = axes.flatten()
    else: # Handle case where subplots returns a single Axes object if nrows=1, ncols=1
         axes = np.array([axes])


# --- Generate Plots ---
legend_handles = {} # To store unique legend handles for the global legend

for i, case in enumerate(test_cases):
    ax = axes[i] # Get the current subplot axis
    locations = case["locations"]
    path_ids = case["path_ids"]
    is_collinear_case = (case["name"] == "Collinear Points (Jumbled Order)")

    # Create a lookup dictionary for location data by id for easier access
    loc_data_map = {loc["id"]: loc for loc in locations}

    # Get coordinates and labels for all points for scattering
    all_lons = [loc["longitude"] for loc in locations]
    all_lats = [loc["latitude"] for loc in locations]
    all_ids = [loc["id"] for loc in locations]

    # --- Plotting Elements ---
    # 1. Plot all location points as scatter plot
    #    Store the returned handle for the legend if not already stored
    scatter_plot = ax.scatter(all_lons, all_lats, zorder=3, label='Locations', s=50)
    if 'Locations' not in legend_handles:
        legend_handles['Locations'] = scatter_plot

    # 2. Add ID labels next to each point
    for lon, lat, id_val in zip(all_lons, all_lats, all_ids):
         # Add a small offset to prevent label overlapping the point
         ax.text(lon + 0.15, lat + 0.15, id_val, fontsize=10, zorder=4)

    # --- Modified Path Plotting (Using Annotate for curve flexibility) ---
    if len(path_ids) > 1:
        # Plot path segments individually using annotate
        for j in range(len(path_ids) - 1):
            start_id = path_ids[j]
            end_id = path_ids[j+1]

            # Get coordinates for the start and end of the current segment
            start_lon, start_lat = loc_data_map[start_id]["longitude"], loc_data_map[start_id]["latitude"]
            end_lon, end_lat = loc_data_map[end_id]["longitude"], loc_data_map[end_id]["latitude"]

            # Define default styles for straight, red lines
            connection_style = 'arc3,rad=0' # arc3 with rad=0 is a straight line
            line_color = 'red'
            segment_label = 'Expected NN Path' # Default label for legend

            # --- Apply CURVE MODIFICATION for the specific case and segments ---
            if is_collinear_case:
                if start_id == 'D' and end_id == 'B':
                     # Curve D->B slightly upwards
                     connection_style = 'arc3,rad=0' # Adjust radius for desired curve
                     line_color = 'red' # Use a distinct color
                elif start_id == 'B' and end_id == 'C':
                     # Curve B->C more significantly upwards for the long jump
                     connection_style = 'arc3,rad=0.3' # Adjust radius for desired curve
                     line_color = 'red' # Use a distinct color
                # Note: The A->D segment will remain straight and red

            # Draw the segment using annotate, applying conditional styles
            # Annotate allows easy curving via connectionstyle
            ax.annotate('', # No text for the annotation itself
                        xy=(end_lon, end_lat),          # End point of the arrow
                        xytext=(start_lon, start_lat),  # Start point of the arrow
                        arrowprops=dict(
                            arrowstyle="->",            # Arrow style
                            connectionstyle=connection_style, # Straight or curved
                            color=line_color,           # Color of the line/arrow
                            lw=1.5,                     # Line width
                            shrinkA=5,                  # Gap before start point
                            shrinkB=5                   # Gap before end point
                        ),
                        zorder=2) # Draw below points/labels

            # --- Manual Legend Handle Creation ---
            # Store a handle for the legend if this segment type is new
            # Since annotate doesn't create legend handles, we create dummy line plots
            if segment_label not in legend_handles:
                # Create an invisible plot with the correct style just for the legend entry
                dummy_handle, = ax.plot([], [], color=line_color, linestyle='-', lw=1.5, label=segment_label)
                legend_handles[segment_label] = dummy_handle


    # --- Plot Configuration (for each subplot) ---
    ax.set_title(case["name"], fontsize=12, pad=10) # Add padding below title
    ax.set_xlabel("Longitude (X-coordinate)", fontsize=9)
    ax.set_ylabel("Latitude (Y-coordinate)", fontsize=9)
    ax.tick_params(axis='both', which='major', labelsize=8) # Adjust tick label size
    ax.grid(True, linestyle=':', alpha=0.7) # Dotted grid lines, slightly transparent
    ax.axis('equal') # Essential for correct visual distance representation

    # Set axis limits dynamically based on data range, with padding
    if all_lons: # Check if lists are not empty to avoid errors on min/max
         min_lon, max_lon = min(all_lons), max(all_lons)
         min_lat, max_lat = min(all_lats), max(all_lats)
         # Ensure there's some range even if all points are identical
         lon_range = max(max_lon - min_lon, 1)
         lat_range = max(max_lat - min_lat, 1)
         # Calculate padding (e.g., 15% of the data range)
         padding_lon = lon_range * 0.15
         padding_lat = lat_range * 0.15
         # Apply padding, ensuring a minimum padding (e.g., 0.5 units)
         ax.set_xlim(min_lon - max(padding_lon, 0.5), max_lon + max(padding_lon, 0.5))
         ax.set_ylim(min_lat - max(padding_lat, 0.5), max_lat + max(padding_lat, 0.5))


# --- Final Figure Adjustments ---

# Hide any unused subplots if grid size > number of tests
for j in range(i + 1, nrows * ncols):
    # Check if axes[j] exists before trying to delete
    if j < len(axes):
        fig.delaxes(axes[j])

# Create a single global legend for the entire figure
# Place it at the bottom center
fig.legend(
    handles=legend_handles.values(),    # Get the collected handles
    loc='lower center',                 # Position
    bbox_to_anchor=(0.5, 0.01),         # Fine-tune position below plots
    ncol=len(legend_handles),           # Arrange horizontally
    fontsize=9
)

# Adjust overall layout to prevent titles/labels overlapping and make space for legend
plt.tight_layout(rect=[0, 0.05, 1, 0.95]) # rect=[left, bottom, right, top]

# Add a main title to the entire figure
fig.suptitle("Visualization of Nearest Neighbor TSP Solver Test Cases", fontsize=16, y=0.99)

# Display the plots
plt.show()