import Property from "../Models/Property.js";

/**
 * @desc    Get all available properties for tenants to explore
 * @route   GET /api/properties
 * @access  Private (Tenant/Admin)
 */
export const getAllProperties = async (req, res) => {
  try {
    // We only want to show properties that are Available or active
    // The model uses status: ['active', 'inactive', 'pending', 'suspended', 'Available', 'Rented', 'Maintenance']
    const properties = await Property.find({
      status: { $in: ['Available', 'active'] }
    }).populate('landlordId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching properties"
    });
  }
};

/**
 * @desc    Get property by ID
 * @route   GET /api/properties/:id
 * @access  Private
 */
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('landlordId', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching property detail"
    });
  }
};

/**
 * @desc    Get only properties belonging to the logged-in landlord
 * @route   GET /api/properties/landlord
 * @access  Private (Landlord/Admin)
 */
export const getLandlordProperties = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    const properties = await Property.find({ landlordId });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    res.status(500).json({ success: false, message: "Server error fetching properties" });
  }
};

/**
 * @desc    Get EVERY property in the system (Admin only)
 * @route   GET /api/properties/admin
 * @access  Private (Admin)
 */
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find().populate('landlordId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching admin properties:", error);
    res.status(500).json({ success: false, message: "Server error fetching all properties" });
  }
};

/**
 * @desc    Create a new property
 * @route   POST /api/properties
 * @access  Private (Landlord/Admin)
 */
export const createProperty = async (req, res) => {
  console.log("Create property request received:", req.body);
  try {
    const { title, description, price, location, type, beds, baths, area, images, image, amenities, status } = req.body;
    const landlordId = req.user.userId;
    console.log("Creating property for landlord:", landlordId);

    // Sync image with images[0] if it exists
    const propertyImages = images && images.length > 0 ? images : (image ? [image] : []);
    const mainImage = image || (images && images.length > 0 ? images[0] : '');

    const newProperty = new Property({
      title,
      description,
      price: price ? price.toString() : '0',
      location,
      type,
      beds,
      baths,
      area,
      landlordId,
      images: propertyImages,
      image: mainImage,
      amenities,
      status: status || 'Available'
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: newProperty
    });
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ success: false, message: "Server error creating property" });
  }
};

/**
 * @desc    Update an existing property
 * @route   PUT /api/properties/:id
 * @access  Private (Landlord/Admin)
 */
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Check if landlord owns this property or is Admin
    if (property.landlordId.toString() !== landlordId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "Not authorized to update this property" });
    }

    // Sync image with images[0] if images is updated
    const updateData = { ...req.body };
    if (updateData.images && updateData.images.length > 0) {
      updateData.image = updateData.images[0];
    } else if (updateData.image && (!updateData.images || updateData.images.length === 0)) {
      updateData.images = [updateData.image];
    }

    if (updateData.price) updateData.price = updateData.price.toString();

    property = await Property.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: property
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ success: false, message: "Server error updating property" });
  }
};

/**
 * @desc    Delete a property
 * @route   DELETE /api/properties/:id
 * @access  Private (Landlord/Admin)
 */
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Check if landlord owns this property or is Admin
    if (property.landlordId.toString() !== landlordId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "Not authorized to delete this property" });
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ success: false, message: "Server error deleting property" });
  }
};
