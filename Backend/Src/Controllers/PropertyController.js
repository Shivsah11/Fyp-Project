/**
 * @file PropertyController.js
 * @description Controller managing rental property listings, registration, updates, status changes, and deletion.
 */

import Property from "../Models/Property.js";

/**
 * Retrieves all properties that are currently set to 'Available' or 'active' for general browsing.
 * Populates owner landlord profile details (names and email).
 *
 * @route GET /api/properties
 * @access Private (Tenant/Admin)
 */
export const getAllProperties = async (req, res) => {
  try {
    // Restrict search results to active/Available statuses only to prevent displaying Rented/Maintenance rooms
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
 * Retrieves full details for a single property based on its unique MongoDB object ID.
 *
 * @route GET /api/properties/:id
 * @access Private
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
 * Retrieves only properties registered by the logged-in Landlord.
 *
 * @route GET /api/properties/landlord
 * @access Private (Landlord/Admin)
 */
export const getLandlordProperties = async (req, res) => {
  try {
    const landlordId = req.user.userId;
    // Find all properties matching the authenticated landlord's ID
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
 * Retrieves all properties recorded in the system, regardless of status.
 *
 * @route GET /api/properties/admin
 * @access Private (Admin)
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
 * Creates a new property listing.
 * Automatically synchronizes backward-compatible 'image' fields with the first item in the 'images' array.
 *
 * @route POST /api/properties
 * @access Private (Landlord/Admin)
 */
export const createProperty = async (req, res) => {
  console.log("Create property request received:", req.body);
  try {
    const { title, description, price, location, type, beds, baths, area, images, image, amenities, status } = req.body;
    const landlordId = req.user.userId;
    console.log("Creating property for landlord:", landlordId);

    // Sync image with images[0] to support both single-image legacy UI and multi-image sliders
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
 * Updates details of an existing property listing.
 * Verifies that the updater is the landlord owner of the property or an administrator.
 *
 * @route PUT /api/properties/:id
 * @access Private (Landlord/Admin)
 */
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Authorization check: User must be either the owner Landlord or a system Admin
    if (property.landlordId.toString() !== landlordId && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: "Not authorized to update this property" });
    }

    // Sync primary image field and multi-image list if either parameter gets updated
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
 * Deletes a property listing.
 * Verifies ownership credentials (only landlord owner or administrator).
 *
 * @route DELETE /api/properties/:id
 * @access Private (Landlord/Admin)
 */
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user.userId;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Authorization check: User must be either the owner Landlord or a system Admin
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

